import {
  type ApplicationWorkspaceAuthContext,
  type UserWorkspaceAuthContext,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export type AgentInboxCallerAuthContext =
  | UserWorkspaceAuthContext
  | ApplicationWorkspaceAuthContext;
