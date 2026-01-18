type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

export function json<T extends JsonValue>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS,
  });
}

export function error(message: string, status = 500): Response {
  return json({ error: message }, status);
}

export function notFound(message = "Not found"): Response {
  return error(message, 404);
}

export function badRequest(message: string): Response {
  return error(message, 400);
}
