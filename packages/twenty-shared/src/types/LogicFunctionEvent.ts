/**
 * AWS HTTP API v2 compatible request format for logic functions
 * @see https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html
 *
 * @typeParam TBody - The type of the request body. Defaults to `object` for parsed JSON bodies.
 */
export type LogicFunctionEvent<TBody = object> = {
  /** HTTP headers (filtered by forwardedRequestHeaders in route trigger) */
  headers: Record<string, string | undefined>;

  /** Query string parameters (multiple values are joined with commas, e.g., "1,2,3") */
  queryStringParameters: Record<string, string | undefined>;

  /** Path parameters extracted from the route pattern (e.g., /users/:id → { id: '123' }). Multiple values are joined with commas. */
  pathParameters: Record<string, string | undefined>;

  /** Request body */
  body: TBody | null;

  /**
   * Original raw request body as a UTF-8 string, before any JSON parsing.
   *
   * Useful for verifying HMAC-style signatures (e.g. GitHub's
   * `X-Hub-Signature-256`) where the signature is computed over the exact
   * bytes of the request body. The parsed `body` field cannot be re-serialized
   * to those bytes (key order, whitespace and unicode escaping all matter).
   *
   * Undefined when the upstream runtime did not preserve the raw body
   * (e.g. older server versions).
   */
  rawBody?: string;

  /** Whether the body is base64 encoded */
  isBase64Encoded: boolean;

  /** Request context containing HTTP method, path, and other metadata */
  requestContext: {
    http: {
      /** HTTP method (GET, POST, PUT, PATCH, DELETE) */
      method: string;
      /** Raw request path (e.g., /users/123) */
      path: string;
    };
  };
};
