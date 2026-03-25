import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { WebhookExceptionCode } from 'src/engine/metadata-modules/webhook/webhook.exception';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

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
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.webhook
  >): FailedFlatEntityValidation<'webhook', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
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
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.webhook
  >): FailedFlatEntityValidation<'webhook', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        targetUrl: flatEntityToValidate.targetUrl,
      },
      metadataName: 'webhook',
      type: 'delete',
    });

    const existingWebhook = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
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
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatWebhookMaps: optimisticFlatWebhookMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.webhook
  >): FailedFlatEntityValidation<'webhook', 'update'> {
    const fromFlatWebhook = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatWebhookMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
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

    const targetUrlUpdate = flatEntityUpdate.targetUrl;

    if (
      isDefined(targetUrlUpdate) &&
      !this.validateTargetUrl(targetUrlUpdate)
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
