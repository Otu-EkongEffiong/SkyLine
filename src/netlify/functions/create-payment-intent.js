// POST /.netlify/functions/payments-create-intent
// Body: { offerId: "off_...", amount: 45000, currency: "usd" }
//   (amount is in the smallest currency unit, e.g. cents)
//
// Creates a Stripe PaymentIntent in test mode for the checkout flow.
// The frontend uses the returned clientSecret with Stripe.js /
// @stripe/react-stripe-js to collect card details, then calls
// flights-book once payment succeeds.

const Stripe = require('stripe');
const { ok, badRequest, serverError, methodNotAllowed, parseBody } = require('./_lib/http');

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured.');
  return new Stripe(key);
}

exports.handler = async (event) => {
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