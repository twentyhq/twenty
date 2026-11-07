import { type ConnectedAccountScope } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

// Kept server side for the length of a sign-in, so the PKCE verifier never travels in the state.
export type McpServerOAuthSession = {
  mcpServerId: string;
  workspaceId: string;
  userId: string;
  userWorkspaceId: string;
  scope: ConnectedAccountScope;
  redirectLocation: string | null;
  codeVerifier: string;
  clientId: string;
};
