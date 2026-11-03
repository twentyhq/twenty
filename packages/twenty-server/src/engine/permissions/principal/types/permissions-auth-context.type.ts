/* @license Enterprise */

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { type FlatWebhook } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook.type';
import { type PermissionScope } from 'src/engine/permissions/principal/types/permission-scope.type';

type PermissionsAuthContextBase = {
  workspace: Pick<FlatWorkspace, 'id'>;
};

type PermissionsRunNarrowing = {
  agentId?: string;
  permissionScope?: PermissionScope;
};

export type PermissionsAuthContext =
  | (PermissionsAuthContextBase &
      PermissionsRunNarrowing & {
        type: 'user';
        workspaceMemberId: string;
        application?: Pick<FlatApplication, 'id'>;
      })
  | (PermissionsAuthContextBase &
      PermissionsRunNarrowing & {
        type: 'apiKey';
        apiKey: { id: string };
        application?: Pick<FlatApplication, 'id'>;
      })
  | (PermissionsAuthContextBase &
      PermissionsRunNarrowing & {
        type: 'application';
        application: Pick<FlatApplication, 'id'>;
      })
  | (PermissionsAuthContextBase & {
      type: 'webhook';
      webhook: Pick<FlatWebhook, 'id'>;
    })
  | (PermissionsAuthContextBase & {
      type: 'system' | 'pendingActivationUser';
    });
