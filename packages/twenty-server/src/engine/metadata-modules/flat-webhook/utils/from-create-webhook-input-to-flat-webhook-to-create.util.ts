import { isNonEmptyString } from '@sniptt/guards';
import {
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { msg } from '@lingui/core/macro';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FlatWebhook } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook.type';
import { type CreateWebhookInput } from 'src/engine/metadata-modules/webhook/dtos/create-webhook.input';
import { computeWebhookRoleTargetOperationsOrThrow } from 'src/engine/metadata-modules/webhook/utils/compute-webhook-role-target-operations-or-throw.util';
import { generateWebhookSecret } from 'src/engine/metadata-modules/webhook/utils/generate-webhook-secret.util';
import {
  WebhookException,
  WebhookExceptionCode,
} from 'src/engine/metadata-modules/webhook/webhook.exception';

export const fromCreateWebhookInputToFlatWebhookToCreate = ({
  createWebhookInput,
  workspaceId,
  flatApplication,
  flatRoleTargetMaps,
  flatRoleMaps,
  flatAgentMaps,
  flatWebhookMaps,
}: {
  createWebhookInput: CreateWebhookInput;
  workspaceId: string;
  flatApplication: FlatApplication;
} & Pick<
  AllFlatEntityMaps,
  'flatRoleTargetMaps' | 'flatRoleMaps' | 'flatAgentMaps' | 'flatWebhookMaps'
>): {
  flatWebhookToCreate: FlatWebhook;
  flatRoleTargetsToCreate: FlatRoleTarget[];
} => {
  if (!isNonEmptyString(createWebhookInput.roleId)) {
    throw new WebhookException(
      'A role is required to create a webhook',
      WebhookExceptionCode.INVALID_WEBHOOK_INPUT,
      { userFriendlyMessage: msg`Select a role for this webhook.` },
    );
  }

  const now = new Date().toISOString();

  const { targetUrl, description } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      createWebhookInput,
      ['targetUrl', 'description'],
    );

  const id = createWebhookInput.id ?? v4();
  const secret = createWebhookInput.secret ?? generateWebhookSecret();

  const flatWebhookToCreate: FlatWebhook = {
    id,
    targetUrl,
    operations: createWebhookInput.operations,
    description: description ?? null,
    secret,
    workspaceId,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    universalIdentifier: id,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  };

  const { flatRoleTargetsToCreate } = computeWebhookRoleTargetOperationsOrThrow(
    {
      webhookId: id,
      roleId: createWebhookInput.roleId,
      workspaceId,
      flatApplication,
      flatRoleTargetMaps,
      flatRoleMaps,
      flatAgentMaps,
      // A duplicate id is left for the migration validation to report
      flatWebhookMaps: isDefined(
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: id,
          flatEntityMaps: flatWebhookMaps,
        }),
      )
        ? flatWebhookMaps
        : addFlatEntityToFlatEntityMapsOrThrow({
            flatEntity: flatWebhookToCreate,
            flatEntityMaps: flatWebhookMaps,
          }),
    },
  );

  return { flatWebhookToCreate, flatRoleTargetsToCreate };
};
