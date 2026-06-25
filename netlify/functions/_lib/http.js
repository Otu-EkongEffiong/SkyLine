/**
 * Small shared helpers so every function returns consistent JSON responses.
 */

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export function ok(body, statusCode = 200) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  };
}

export function badRequest(message) {
  return ok({ error: message }, 400);
}

export function serverError(message) {
  return ok({ error: message || 'Internal server error' }, 500);
}

export function methodNotAllowed() {
  return ok({ error: 'Method not allowed' }, 405);
}

export function parseBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}