import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { FLAT_WEBHOOK_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-webhook/constants/flat-webhook-editable-properties.constant';
import { type FlatWebhook } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook.type';
import { type UpdateWebhookInput } from 'src/engine/metadata-modules/webhook/dtos/update-webhook.input';
import { computeWebhookRoleTargetOperationsOrThrow } from 'src/engine/metadata-modules/webhook/utils/compute-webhook-role-target-operations-or-throw.util';
import {
  WebhookException,
  WebhookExceptionCode,
} from 'src/engine/metadata-modules/webhook/webhook.exception';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateWebhookInputToFlatWebhookToUpdateOrThrow = ({
  updateWebhookInput,
  workspaceId,
  flatApplication,
  flatRoleTargetMaps,
  flatRoleMaps,
  flatAgentMaps,
  flatWebhookMaps,
}: {
  updateWebhookInput: UpdateWebhookInput;
  workspaceId: string;
  flatApplication: FlatApplication;
} & Pick<
  AllFlatEntityMaps,
  'flatRoleTargetMaps' | 'flatRoleMaps' | 'flatAgentMaps' | 'flatWebhookMaps'
>): {
  flatWebhookToUpdate: FlatWebhook;
  flatRoleTargetsToCreate: FlatRoleTarget[];
  flatRoleTargetsToDelete: FlatRoleTarget[];
} => {
  const existingFlatWebhook = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: updateWebhookInput.id,
    flatEntityMaps: flatWebhookMaps,
  });

  if (!isDefined(existingFlatWebhook)) {
    throw new WebhookException(
      'Webhook not found',
      WebhookExceptionCode.WEBHOOK_NOT_FOUND,
    );
  }

  const { flatRoleTargetsToCreate, flatRoleTargetsToDelete } =
    computeWebhookRoleTargetOperationsOrThrow({
      webhookId: existingFlatWebhook.id,
      roleId: updateWebhookInput.update.roleId,
      workspaceId,
      flatApplication,
      flatRoleTargetMaps,
      flatRoleMaps,
      flatAgentMaps,
      flatWebhookMaps,
    });

  return {
    flatWebhookToUpdate: {
      ...mergeUpdateInExistingRecord({
        existing: existingFlatWebhook,
        properties: [...FLAT_WEBHOOK_EDITABLE_PROPERTIES],
        update: updateWebhookInput.update,
      }),
      updatedAt: new Date().toISOString(),
    },
    flatRoleTargetsToCreate,
    flatRoleTargetsToDelete,
  };
};
