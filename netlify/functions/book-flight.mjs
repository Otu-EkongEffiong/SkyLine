import Stripe from 'stripe';
import { ok, badRequest, serverError, methodNotAllowed, parseBody } from './_lib/http.js';
import { getOffer, createOrder } from './_lib/duffelClient.js';
import { getSupabaseAdmin } from './_lib/supabaseAdmin.js';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured.');
  return new Stripe(key);
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  const { offerId, passengers, paymentIntentId, userId } = parseBody(event);
  if (!offerId || !passengers?.length || !paymentIntentId) {
    return badRequest('offerId, passengers, and paymentIntentId are required.');
  }

  try {
    // 1. Confirm payment actually succeeded before issuing the ticket.
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return badRequest(`Payment has not completed (status: ${paymentIntent.status}).`);
    }

    // 2. Fetch offer details to attach required Duffel passenger `id`s (e.g. pas_0000...)
    const offerDetails = await getOffer(offerId);
    const offerPassengers = offerDetails?.data?.passengers || [];

    const formattedPassengers = passengers.map((p, index) => ({
      ...p,
      id: p.id || offerPassengers[index]?.id,
    }));

    // 3. Create the order with Duffel using the updated passenger list.
    const orderResult = await createOrder({ offerId, passengers: formattedPassengers });
    const order = orderResult?.data;

    if (!order) {
      return serverError('Failed to retrieve order data from Duffel.');
    }

    // 4. Persist the booking to Supabase for MyTrips / TripDetails.
    const supabase = getSupabaseAdmin();
    const tripRecord = {
      booking_reference: order.booking_reference,
      duffel_order_id: order.id,
      user_id: userId || null,
      status: 'upcoming',
      origin: order.slices[0]?.segments[0]?.origin,
      destination: order.slices[order.slices.length - 1]?.segments?.slice(-1)[0]?.destination,
      departure_date: order.slices[0]?.segments[0]?.departing_at,
      arrival_date: order.slices[order.slices.length - 1]?.segments?.slice(-1)[0]?.arriving_at,
      price: parseFloat(order.total_amount),
      currency: order.total_currency,
      payment_intent_id: paymentIntentId,
      passengers: formattedPassengers,
      segments: order.slices.flatMap((slice) => slice.segments),
      created_at: new Date().toISOString(),
    };

    const { data: savedTrip, error: insertError } = await supabase
      .from('trips')
      .insert(tripRecord)
      .select()
      .single();

    if (insertError) {
      // Booking with the airline already succeeded — don't fail the
      // whole request just because the local record failed to save.
      console.error('Failed to persist booking to Supabase:', insertError);
    }

    return ok({
      bookingReference: order.booking_reference,
      orderId: order.id,
      trip: savedTrip || tripRecord,
    });
  } catch (err) {
    console.error('book-flight error:', err);
    return serverError(err.message || 'Booking failed.');
  }
};