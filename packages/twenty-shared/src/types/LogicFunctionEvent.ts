export type LogicFunctionEvent<TBody = object> = {
  headers: Record<string, string | undefined>;
  queryStringParameters: Record<string, string | undefined>;
  pathParameters: Record<string, string | undefined>;
  body: TBody | null;
  rawBody?: string;
  isBase64Encoded: boolean;
  requestContext: {
    http: {
      method: string;
      path: string;
    };
  };
  // Populated for HTTP-route triggers with `isAuthRequired: true`. null
  // when the trigger fires without a user (cron, database events) or when
  // auth is disabled.
  userWorkspaceId: string | null;
  // Verified id of the calling application, derived from the request's
  // authenticated app access token. null when the caller is not an
  // application (user, cron, database events) or auth is disabled. Always
  // server-populated from the verified auth context, never from request input.
  callerApplicationId: string | null;
  // Verified universalIdentifier of the calling application, from the same
  // authenticated app access token. Stable across workspaces and installs,
  // so it is the identity apps know each other by. null and server-populated
  // under the same conditions as callerApplicationId.
  callerApplicationUniversalIdentifier: string | null;
};
