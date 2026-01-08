import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { CronTriggerExceptionCode } from 'src/engine/metadata-modules/cron-trigger/exceptions/cron-trigger.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class FlatCronTriggerValidatorService {
  constructor() {}

  public validateFlatCronTriggerUpdate({
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatCronTriggerMaps: optimisticFlatCronTriggerMaps,
      flatServerlessFunctionMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.cronTrigger
  >): FailedFlatEntityValidation<'cronTrigger', 'update'> {
    const existingFlatCronTrigger =
      optimisticFlatCronTriggerMaps.byId[flatEntityId];

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier: existingFlatCronTrigger?.universalIdentifier,
      },
      metadataName: 'cronTrigger',
      type: 'update',
    });

    if (!isDefined(existingFlatCronTrigger)) {
      validationResult.errors.push({
        code: CronTriggerExceptionCode.CRON_TRIGGER_NOT_FOUND,
        message: t`Cron trigger not found`,
        userFriendlyMessage: msg`Cron trigger not found`,
      });

      return validationResult;
    }

    const updatedFlatCronTrigger = {
      ...existingFlatCronTrigger,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      }),
    };

    const serverlessFunction =
      flatServerlessFunctionMaps.byId[
        updatedFlatCronTrigger.serverlessFunctionId
      ];

    if (!isDefined(serverlessFunction)) {
      validationResult.errors.push({
        code: CronTriggerExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
        message: t`Serverless function not found`,
        userFriendlyMessage: msg`Serverless function not found`,
      });
    }

    return validationResult;
  }

  public validateFlatCronTriggerDeletion({
    flatEntityToValidate: { id: cronTriggerIdToDelete, universalIdentifier },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatCronTriggerMaps: optimisticFlatCronTriggerMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.cronTrigger
  >): FailedFlatEntityValidation<'cronTrigger', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: cronTriggerIdToDelete,
        universalIdentifier,
      },
      metadataName: 'cronTrigger',
      type: 'delete',
    });

    const existingFlatCronTrigger =
      optimisticFlatCronTriggerMaps.byId[cronTriggerIdToDelete];

    if (!isDefined(existingFlatCronTrigger)) {
      validationResult.errors.push({
        code: CronTriggerExceptionCode.CRON_TRIGGER_NOT_FOUND,
        message: t`Cron trigger not found`,
        userFriendlyMessage: msg`Cron trigger not found`,
      });
    }

    return validationResult;
  }

  public validateFlatCronTriggerCreation({
    flatEntityToValidate: flatCronTriggerToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatCronTriggerMaps: optimisticFlatCronTriggerMaps,
      flatServerlessFunctionMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.cronTrigger
  >): FailedFlatEntityValidation<'cronTrigger', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatCronTriggerToValidate.id,
        universalIdentifier: flatCronTriggerToValidate.universalIdentifier,
      },
      metadataName: 'cronTrigger',
      type: 'create',
    });

    if (
      isDefined(
        optimisticFlatCronTriggerMaps.byId[flatCronTriggerToValidate.id],
      )
    ) {
      validationResult.errors.push({
        code: CronTriggerExceptionCode.CRON_TRIGGER_ALREADY_EXIST,
        message: t`Cron trigger with same id already exists`,
        userFriendlyMessage: msg`Cron trigger already exists`,
      });
    }

    const serverlessFunction =
      flatServerlessFunctionMaps.byId[
        flatCronTriggerToValidate.serverlessFunctionId
      ];

    if (!isDefined(serverlessFunction)) {
      validationResult.errors.push({
        code: CronTriggerExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
        message: t`Serverless function not found`,
        userFriendlyMessage: msg`Serverless function not found`,
      });
    }

    return validationResult;
  }
}
