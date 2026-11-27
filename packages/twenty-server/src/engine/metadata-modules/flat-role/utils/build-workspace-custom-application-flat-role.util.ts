import {
  WORKSPACE_CUSTOM_APPLICATION_ROLE_LABEL,
  WORKSPACE_CUSTOM_APPLICATION_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/engine/core-modules/application/constants/workspace-custom-application-role.constant';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { buildAdminFlatRole } from 'src/engine/metadata-modules/flat-role/utils/build-admin-flat-role.util';

export const buildWorkspaceCustomApplicationFlatRole = ({
  workspaceId,
  workspaceCustomFlatApplication,
}: {
  workspaceId: string;
  workspaceCustomFlatApplication: Pick<
    FlatApplication,
    'id' | 'universalIdentifier'
  >;
}): FlatRole =>
  buildAdminFlatRole({
    workspaceId,
    ownerFlatApplication: workspaceCustomFlatApplication,
    overrides: {
      universalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_ROLE_UNIVERSAL_IDENTIFIER,
      label: WORKSPACE_CUSTOM_APPLICATION_ROLE_LABEL,
      description: 'Default role of the workspace custom application',
      icon: 'IconApps',
      canBeAssignedToUsers: false,
      canBeAssignedToApiKeys: false,
    },
  });
