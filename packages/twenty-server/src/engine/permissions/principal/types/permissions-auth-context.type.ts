/* @license Enterprise */

import {
  type ApiKeyWorkspaceAuthContext,
  type ApplicationWorkspaceAuthContext,
  type PendingActivationUserWorkspaceAuthContext,
  type SystemWorkspaceAuthContext,
  type UserWorkspaceAuthContext,
} from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatWebhook } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook.type';

type PermissionsWorkspace = Pick<UserWorkspaceAuthContext['workspace'], 'id'>;

type PermissionsApplication = Pick<
  ApplicationWorkspaceAuthContext['application'],
  'id'
>;

type PermissionsUserAuthContext = Pick<
  UserWorkspaceAuthContext,
  'type' | 'workspaceMemberId' | 'agentId' | 'aiRunScope'
> & {
  workspace: PermissionsWorkspace;
  application?: PermissionsApplication;
};

type PermissionsApiKeyAuthContext = Pick<
  ApiKeyWorkspaceAuthContext,
  'type' | 'agentId' | 'aiRunScope'
> & {
  workspace: PermissionsWorkspace;
  apiKey: Pick<ApiKeyWorkspaceAuthContext['apiKey'], 'id'>;
  application?: PermissionsApplication;
};

type PermissionsApplicationAuthContext = Pick<
  ApplicationWorkspaceAuthContext,
  'type' | 'agentId' | 'aiRunScope'
> & {
  workspace: PermissionsWorkspace;
  application: PermissionsApplication;
};

type PermissionsWebhookAuthContext = {
  type: 'webhook';
  workspace: PermissionsWorkspace;
  webhook: Pick<FlatWebhook, 'id'>;
};

type PermissionsWithoutActorAuthContext = Pick<
  SystemWorkspaceAuthContext | PendingActivationUserWorkspaceAuthContext,
  'type'
> & {
  workspace: PermissionsWorkspace;
};

export type PermissionsAuthContext =
  | PermissionsUserAuthContext
  | PermissionsApiKeyAuthContext
  | PermissionsApplicationAuthContext
  | PermissionsWebhookAuthContext
  | PermissionsWithoutActorAuthContext;
