import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { fromCreateRoleInputToFlatRoleToCreate } from 'src/engine/metadata-modules/flat-role/utils/from-create-role-input-to-flat-role-to-create.util';
import { PERSONAL_ROLE_LABEL_PREFIX } from 'src/engine/permissions/channel-visibility/constants/personal-role.constant';
import { getPersonalRoleUniversalIdentifier } from 'src/engine/permissions/channel-visibility/utils/get-personal-role-universal-identifier.util';

export const buildPersonalFlatRole = ({
  workspaceId,
  userWorkspaceId,
  flatApplication,
}: {
  workspaceId: string;
  userWorkspaceId: string;
  flatApplication: FlatApplication;
}): FlatRole => ({
  ...fromCreateRoleInputToFlatRoleToCreate({
    createRoleInput: {
      label: `${PERSONAL_ROLE_LABEL_PREFIX}${userWorkspaceId}`,
      description: 'Channel visibility of one workspace member',
      icon: 'IconLock',
      universalIdentifier: getPersonalRoleUniversalIdentifier(userWorkspaceId),
      canBeAssignedToUsers: false,
      canBeAssignedToAgents: false,
      canBeAssignedToApiKeys: false,
    },
    workspaceId,
    flatApplication,
  }),
  isEditable: false,
  isSystemSideEffect: true,
});
