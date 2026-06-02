// Wire shape exchanged between an app's logic-function runtime and the
// `/apps/connections/list` and `/apps/connections/get` endpoints.
//
// Lives in twenty-shared so both sides — the SDK helpers (`listConnections`,
// `getConnection`) and the server controller / DTO — pick from one source
// of truth. Adding a field on either side without updating this type will
// fail typecheck.
export type AppConnection = {
  id: string;
  // The app-developer-facing provider name (e.g. "linear"), as declared on
  // `defineConnectionProvider({ name })`. Useful when listing across providers
  // without a filter.
  providerName: string;
  // User-given (or auto-derived from the OAuth handle) display label.
  // Falls back to `handle` when the user never set one. Suitable for logs
  // and end-user UI.
  name: string;
  // OAuth-derived identifier (typically email or login). Stays stable across
  // reconnects of the same upstream account.
  handle: string;
  // Connection-row visibility:
  //   'user'      = visible only to the user who created it.
  //   'workspace' = visible to every user in the workspace.
  // Named `visibility` (not `scope`) to disambiguate from the `scopes`
  // array below, which is the unrelated set of OAuth permissions granted
  // by the upstream provider.
  visibility: 'user' | 'workspace';
  // The userWorkspace that originally created the credential (also the owner
  // for `scope: 'user'` credentials). Match against `event.userWorkspaceId`
  // to resolve the request user's connection.
  userWorkspaceId: string;
  accessToken: string;
  // OAuth scopes actually granted by the upstream provider on the most recent
  // token issuance (may be a subset of what the app requested).
  scopes: string[];
  // Set when the most recent refresh attempt failed permanently
  // (4xx invalid_grant); the user must reconnect from the app's settings tab.
  // Apps should surface this so users know to take action.
  authFailedAt: string | null;
};
