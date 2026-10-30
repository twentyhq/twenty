import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { findFlatRoleTargetFromForeignKey } from 'src/engine/metadata-modules/flat-role-target/utils/find-flat-role-target-from-foreign-key.util';
import { fromCreateRoleTargetInputToFlatRoleTargetToCreate } from 'src/engine/metadata-modules/role-target/utils/from-create-role-target-input-to-flat-role-target-to-create.util';

export const computeWebhookRoleTargetOperations = ({
  webhookId,
  roleId,
  workspaceId,
  flatApplication,
  flatRoleTargetMaps,
  flatRoleMaps,
  flatAgentMaps,
  flatWebhookMaps,
}: {
  webhookId: string;
  roleId: string | null | undefined;
  workspaceId: string;
  flatApplication: FlatApplication;
} & Pick<
  AllFlatEntityMaps,
  'flatRoleTargetMaps' | 'flatRoleMaps' | 'flatAgentMaps' | 'flatWebhookMaps'
>): {
  flatRoleTargetsToCreate: FlatRoleTarget[];
  flatRoleTargetsToDelete: FlatRoleTarget[];
} => {
  if (roleId === undefined) {
    return { flatRoleTargetsToCreate: [], flatRoleTargetsToDelete: [] };
  }

  const existingFlatRoleTarget = findFlatRoleTargetFromForeignKey({
    flatRoleTargetMaps,
    targetMetadataForeignKey: 'webhookId',
    targetId: webhookId,
  });

  if (roleId === null) {
    return {
      flatRoleTargetsToCreate: [],
      flatRoleTargetsToDelete: isDefined(existingFlatRoleTarget)
        ? [existingFlatRoleTarget]
        : [],
    };
  }

  if (existingFlatRoleTarget?.roleId === roleId) {
    return { flatRoleTargetsToCreate: [], flatRoleTargetsToDelete: [] };
  }

  const { flatRoleTargetToCreate, flatRoleTargetsToDelete } =
    fromCreateRoleTargetInputToFlatRoleTargetToCreate({
      createRoleTargetInput: {
        roleId,
        targetId: webhookId,
        targetMetadataForeignKey: 'webhookId',
      },
      workspaceId,
      flatRoleTargetMaps,
      flatRoleMaps,
      flatAgentMaps,
      flatWebhookMaps,
      flatApplication,
    });

  return {
    flatRoleTargetsToCreate: [flatRoleTargetToCreate],
    flatRoleTargetsToDelete,
  };
};
