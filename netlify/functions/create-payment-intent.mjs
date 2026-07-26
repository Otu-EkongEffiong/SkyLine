import Stripe from 'stripe';
import { ok, badRequest, serverError, methodNotAllowed, parseBody } from './_lib/http.js';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured.');
  return new Stripe(key);
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  const { offerId, amount, currency } = parseBody(event);
  if (!offerId || !amount || !currency) {
    return badRequest('offerId, amount, and currency are required.');
  }

  try {
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: currency.toLowerCase(),
      metadata: { offerId },
      automatic_payment_methods: { enabled: true },
    });

    return ok({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error('payments-create-intent error:', err);
    return serverError(err.message || 'Could not create payment intent.');
  }
};