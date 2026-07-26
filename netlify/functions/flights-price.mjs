//naming issue fixed

const { ok, badRequest, serverError, methodNotAllowed, parseBody } = require('./_lib/http');
const duffel = require('./_lib/duffelClient');

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  const { offerId } = parseBody(event);
  if (!offerId) return badRequest('offerId is required.');

  try {
    const result = await duffel.getOffer(offerId);
    const offer = result?.data;

    return ok({
      offerId: offer.id,
      totalAmount: parseFloat(offer.total_amount),
      currency: offer.total_currency,
      expiresAt: offer.expires_at,
      available: offer.available !== false,
    });
  } catch (err) {
    console.error('flights-price error:', err);
    return serverError(err.message || 'Could not price this offer — it may have expired.');
  }
};