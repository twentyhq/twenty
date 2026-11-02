import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { findFlatRoleTargetFromForeignKey } from 'src/engine/metadata-modules/flat-role-target/utils/find-flat-role-target-from-foreign-key.util';
import { fromCreateRoleTargetInputToFlatRoleTargetToCreate } from 'src/engine/metadata-modules/role-target/utils/from-create-role-target-input-to-flat-role-target-to-create.util';
import {
  WebhookException,
  WebhookExceptionCode,
} from 'src/engine/metadata-modules/webhook/webhook.exception';

export const computeWebhookRoleTargetOperationsOrThrow = ({
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
  roleId: string | undefined;
  workspaceId: string;
  flatApplication: FlatApplication;
} & Pick<
  AllFlatEntityMaps,
  'flatRoleTargetMaps' | 'flatRoleMaps' | 'flatAgentMaps' | 'flatWebhookMaps'
>): {
  flatRoleTargetsToCreate: FlatRoleTarget[];
  flatRoleTargetsToDelete: FlatRoleTarget[];
} => {
  if (!isDefined(roleId)) {
    return { flatRoleTargetsToCreate: [], flatRoleTargetsToDelete: [] };
  }

  if (
    !isDefined(
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: roleId,
        flatEntityMaps: flatRoleMaps,
      }),
    )
  ) {
    throw new WebhookException(
      `Role ${roleId} not found`,
      WebhookExceptionCode.INVALID_WEBHOOK_INPUT,
      { userFriendlyMessage: msg`The selected role does not exist.` },
    );
  }

  const existingFlatRoleTarget = findFlatRoleTargetFromForeignKey({
    flatRoleTargetMaps,
    targetMetadataForeignKey: 'webhookId',
    targetId: webhookId,
  });

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
