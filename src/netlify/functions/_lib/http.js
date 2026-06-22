/**
 * Small shared helpers so every function returns consistent JSON responses.
 */

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function ok(body, statusCode = 200) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  };
}

function badRequest(message) {
  return ok({ error: message }, 400);
}

function serverError(message) {
  return ok({ error: message || 'Internal server error' }, 500);
}

function methodNotAllowed() {
  return ok({ error: 'Method not allowed' }, 405);
}

function parseBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}

module.exports = { ok, badRequest, serverError, methodNotAllowed, parseBody };
