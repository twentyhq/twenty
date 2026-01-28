import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WebhookExceptionCode } from 'src/engine/metadata-modules/webhook/webhook.exception';
import { findFlatEntityPropertyUpdate } from 'src/engine/workspace-manager/workspace-migration/utils/find-flat-entity-property-update.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-update-validation-args.type';
import { type FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';

@Injectable()
export class FlatWebhookValidatorService {
  private validateTargetUrl(targetUrl: string): boolean {
    try {
      const url = new URL(targetUrl);

      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  public validateFlatWebhookCreation({
    flatEntityToValidate: flatWebhook,
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.webhook
  >): FailedFlatEntityValidation<'webhook', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatWebhook.id,
        universalIdentifier: flatWebhook.universalIdentifier,
        targetUrl: flatWebhook.targetUrl,
      },
      metadataName: 'webhook',
      type: 'create',
    });

    if (!isNonEmptyString(flatWebhook.targetUrl)) {
      validationResult.errors.push({
        code: WebhookExceptionCode.INVALID_WEBHOOK_INPUT,
        message: t`Target URL is required`,
        userFriendlyMessage: msg`Target URL is required`,
      });
    }

    if (!this.validateTargetUrl(flatWebhook.targetUrl)) {
      validationResult.errors.push({
        code: WebhookExceptionCode.INVALID_TARGET_URL,
        message: t`Invalid target URL provided`,
        userFriendlyMessage: msg`Please provide a valid HTTP or HTTPS URL`,
      });
    }

    return validationResult;
  }

  public validateFlatWebhookDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatWebhookMaps: optimisticFlatWebhookMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.webhook
  >): FailedFlatEntityValidation<'webhook', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityToValidate.id,
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        targetUrl: flatEntityToValidate.targetUrl,
      },
      metadataName: 'webhook',
      type: 'delete',
    });

    const existingWebhook = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatEntityToValidate.id,
      flatEntityMaps: optimisticFlatWebhookMaps,
    });

    if (!isDefined(existingWebhook)) {
      validationResult.errors.push({
        code: WebhookExceptionCode.WEBHOOK_NOT_FOUND,
        message: t`Webhook not found`,
        userFriendlyMessage: msg`Webhook not found`,
      });
    }

    return validationResult;
  }

  public validateFlatWebhookUpdate({
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatWebhookMaps: optimisticFlatWebhookMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.webhook
  >): FailedFlatEntityValidation<'webhook', 'update'> {
    const fromFlatWebhook = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId,
      flatEntityMaps: optimisticFlatWebhookMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier: fromFlatWebhook?.universalIdentifier,
      },
      metadataName: 'webhook',
      type: 'update',
    });

    if (!isDefined(fromFlatWebhook)) {
      validationResult.errors.push({
        code: WebhookExceptionCode.WEBHOOK_NOT_FOUND,
        message: t`Webhook not found`,
        userFriendlyMessage: msg`Webhook not found`,
      });

      return validationResult;
    }

    const targetUrlUpdate = findFlatEntityPropertyUpdate({
      flatEntityUpdates,
      property: 'targetUrl',
    });

    if (
      isDefined(targetUrlUpdate) &&
      !this.validateTargetUrl(targetUrlUpdate.to)
    ) {
      validationResult.errors.push({
        code: WebhookExceptionCode.INVALID_TARGET_URL,
        message: t`Invalid target URL provided`,
        userFriendlyMessage: msg`Please provide a valid HTTP or HTTPS URL`,
      });
    }

    return validationResult;
  }
}
