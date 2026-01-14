/**
 * AWS HTTP API v2 compatible request format for serverless functions
 * @see https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html
 *
 * @typeParam TBody - The type of the request body. Defaults to `object` for parsed JSON bodies.
 */
export type ServerlessFunctionEvent<TBody = object> = {
  /** HTTP headers (filtered by forwardedRequestHeaders in route trigger) */
  headers: Record<string, string | undefined>;

  /** Query string parameters */
  queryStringParameters: Record<string, string | string[] | undefined>;

  /** Path parameters extracted from the route pattern (e.g., /users/:id → { id: '123' }) */
  pathParameters: Record<string, string | string[] | undefined>;

  /** Request body */
  body: TBody | null;

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
