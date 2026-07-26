const TOKEN_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';

let cachedToken = null;
let cachedTokenExpiresAt = 0;

async function fetchNewToken(clientId, clientSecret) {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenSky OAuth2 token request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    // Refresh a bit early (55s buffer) rather than right at expiry.
    expiresAt: Date.now() + (data.expires_in - 55) * 1000,
  };
}

/**
 * Returns headers to attach to an OpenSky API request — either a
 * cached/fresh Bearer token, or no Authorization header at all for
 * anonymous (rate-limited) access if no credentials are configured.
 */
async function getOpenSkyAuthHeaders() {
  const { OPENSKY_CLIENT_ID, OPENSKY_CLIENT_SECRET } = process.env;

  if (!OPENSKY_CLIENT_ID || !OPENSKY_CLIENT_SECRET) {
    return {}; // anonymous — no auth header
  }

  if (cachedToken && Date.now() < cachedTokenExpiresAt) {
    return { Authorization: `Bearer ${cachedToken}` };
  }

  const { accessToken, expiresAt } = await fetchNewToken(OPENSKY_CLIENT_ID, OPENSKY_CLIENT_SECRET);
  cachedToken = accessToken;
  cachedTokenExpiresAt = expiresAt;
  return { Authorization: `Bearer ${accessToken}` };
}

export { getOpenSkyAuthHeaders };