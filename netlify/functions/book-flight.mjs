// Docs on request and context https://docs netlify.com/functions/build/#code-your-function-2
 

/**
 * POST / netlify/functions/flights-book
// Body: {
//   offerId: "off_...",
//   passengers: [{ id, given_name, family_name, born_on, ... }],
//   paymentIntentId: "pi_..."
// }
//
// Confirms the Stripe PaymentIntent succeeded, creates the order with
// Duffel, then persists a booking record to Supabase (trip details,
// booking reference, passengers) so MyTrips.jsx / TripDetails.jsx can
// read it back for the signed-in user.
*/


const Stripe = require('stripe');
const { ok, badRequest, serverError, methodNotAllowed, parseBody } = require('./_lib/http');
const duffel = require('./_lib/duffelClient');
const { getSupabaseAdmin } = require('./_lib/supabaseAdmin');

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured.');
  return new Stripe(key);
}

exports.handler = async (event) => {
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

    // 2. Create the order with Duffel.
    const orderResult = await duffel.createOrder({ offerId, passengers });
    const order = orderResult?.data;

    // 3. Persist the booking to Supabase for MyTrips / TripDetails.
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
      passengers,
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
    console.error('flights-book error:', err);
    return serverError(err.message || 'Booking failed.');
  }
};