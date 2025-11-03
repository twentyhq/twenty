import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { CronTriggerExceptionCode } from 'src/engine/metadata-modules/cron-trigger/exceptions/cron-trigger.exception';
import { FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
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
  >): FailedFlatEntityValidation<FlatCronTrigger> {
    const validationResult: FailedFlatEntityValidation<FlatCronTrigger> = {
      type: 'update_cron_trigger',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatEntityId,
      },
    };

    const existingFlatCronTrigger =
      optimisticFlatCronTriggerMaps.byId[flatEntityId];

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
    flatEntityToValidate: { id: cronTriggerIdToDelete },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatCronTriggerMaps: optimisticFlatCronTriggerMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.cronTrigger
  >): FailedFlatEntityValidation<FlatCronTrigger> {
    const validationResult: FailedFlatEntityValidation<FlatCronTrigger> = {
      type: 'delete_cron_trigger',
      errors: [],
      flatEntityMinimalInformation: {
        id: cronTriggerIdToDelete,
      },
    };

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

  public async validateFlatCronTriggerCreation({
    flatEntityToValidate: flatCronTriggerToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatCronTriggerMaps: optimisticFlatCronTriggerMaps,
      flatServerlessFunctionMaps,
    },
  }: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.cronTrigger>): Promise<
    FailedFlatEntityValidation<FlatCronTrigger>
  > {
    const validationResult: FailedFlatEntityValidation<FlatCronTrigger> = {
      type: 'create_cron_trigger',
      errors: [],
      flatEntityMinimalInformation: {
        id: flatCronTriggerToValidate.id,
      },
    };

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
