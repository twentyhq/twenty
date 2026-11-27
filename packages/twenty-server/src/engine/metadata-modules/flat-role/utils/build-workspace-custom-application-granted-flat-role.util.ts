import {
  WORKSPACE_CUSTOM_APPLICATION_GRANTED_ROLE_LABEL,
  WORKSPACE_CUSTOM_APPLICATION_GRANTED_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/engine/core-modules/application/constants/workspace-custom-application-granted-role.constant';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { buildWorkspaceCustomApplicationAdminFlatRole } from 'src/engine/metadata-modules/flat-role/utils/build-workspace-custom-application-admin-flat-role.util';

export const buildWorkspaceCustomApplicationGrantedFlatRole = ({
  workspaceId,
  workspaceCustomFlatApplication,
}: {
  workspaceId: string;
  workspaceCustomFlatApplication: Pick<
    FlatApplication,
    'id' | 'universalIdentifier'
  >;
}): FlatRole =>
  buildWorkspaceCustomApplicationAdminFlatRole({
    workspaceId,
    ownerFlatApplication: workspaceCustomFlatApplication,
    overrides: {
      universalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_GRANTED_ROLE_UNIVERSAL_IDENTIFIER,
      label: WORKSPACE_CUSTOM_APPLICATION_GRANTED_ROLE_LABEL,
      description: 'Default role of the workspace custom application',
      icon: 'IconApps',
      canBeAssignedToUsers: false,
      canBeAssignedToApiKeys: false,
    },
  });
