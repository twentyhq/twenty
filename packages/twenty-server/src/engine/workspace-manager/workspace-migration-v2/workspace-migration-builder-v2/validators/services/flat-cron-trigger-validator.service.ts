import { Injectable } from '@nestjs/common';

import { t, msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { CronTriggerExceptionCode } from 'src/engine/metadata-modules/cron-trigger/exceptions/cron-trigger.exception';
import { FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';
import { CronTriggerRelatedFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/cron-trigger/types/cron-trigger-related-flat-entity-maps.type';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

type CronTriggerValidationArgs = {
  flatCronTriggerToValidate: FlatCronTrigger;
  optimisticFlatCronTriggerMaps: FlatEntityMaps<FlatCronTrigger>;
  dependencyOptimisticFlatEntityMaps: CronTriggerRelatedFlatEntityMaps;
};
// TODO: validate settings integrity
@Injectable()
export class FlatCronTriggerValidatorService {
  constructor() {}

  public validateFlatCronTriggerUpdate({
    flatCronTriggerToValidate: updatedFlatCronTrigger,
    optimisticFlatCronTriggerMaps,
    dependencyOptimisticFlatEntityMaps,
  }: CronTriggerValidationArgs): FailedFlatEntityValidation<FlatCronTrigger> {
    const errors = [];

    const existingFlatCronTrigger =
      optimisticFlatCronTriggerMaps.byId[updatedFlatCronTrigger.id];

    if (!isDefined(existingFlatCronTrigger)) {
      errors.push({
        code: CronTriggerExceptionCode.CRON_TRIGGER_NOT_FOUND,
        message: t`Cron trigger not found`,
        userFriendlyMessage: msg`Cron trigger not found`,
      });
    }

    const serverlessFunction =
      dependencyOptimisticFlatEntityMaps.flatServerlessFunctionMaps?.byId?.[
        updatedFlatCronTrigger.serverlessFunctionId
      ];

    if (!isDefined(serverlessFunction)) {
      errors.push({
        code: CronTriggerExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
        message: t`Serverless function not found`,
        userFriendlyMessage: msg`Serverless function not found`,
      });
    }

    return {
      type: 'update_cron_trigger',
      errors,
      flatEntityMinimalInformation: {
        id: updatedFlatCronTrigger.id,
      },
    };
  }

  public validateFlatCronTriggerDeletion({
    flatCronTriggerToValidate: { id: cronTriggerIdToDelete },
    optimisticFlatCronTriggerMaps,
  }: CronTriggerValidationArgs): FailedFlatEntityValidation<FlatCronTrigger> {
    const errors = [];

    const existingFlatCronTrigger =
      optimisticFlatCronTriggerMaps.byId[cronTriggerIdToDelete];

    if (!isDefined(existingFlatCronTrigger)) {
      errors.push({
        code: CronTriggerExceptionCode.CRON_TRIGGER_NOT_FOUND,
        message: t`Cron trigger not found`,
        userFriendlyMessage: msg`Cron trigger not found`,
      });
    }

    return {
      type: 'delete_cron_trigger',
      errors,
      flatEntityMinimalInformation: {
        id: cronTriggerIdToDelete,
      },
    };
  }

  public async validateFlatCronTriggerCreation({
    flatCronTriggerToValidate,
    optimisticFlatCronTriggerMaps,
    dependencyOptimisticFlatEntityMaps,
  }: CronTriggerValidationArgs): Promise<
    FailedFlatEntityValidation<FlatCronTrigger>
  > {
    const errors = [];

    if (
      isDefined(
        optimisticFlatCronTriggerMaps.byId[flatCronTriggerToValidate.id],
      )
    ) {
      errors.push({
        code: CronTriggerExceptionCode.CRON_TRIGGER_ALREADY_EXIST,
        message: t`Cron trigger with same id already exists`,
        userFriendlyMessage: msg`Cron trigger already exists`,
      });
    }

    const serverlessFunction =
      dependencyOptimisticFlatEntityMaps.flatServerlessFunctionMaps?.byId?.[
        flatCronTriggerToValidate.serverlessFunctionId
      ];

    if (!isDefined(serverlessFunction)) {
      errors.push({
        code: CronTriggerExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
        message: t`Serverless function not found`,
        userFriendlyMessage: msg`Serverless function not found`,
      });
    }

    return {
      type: 'create_cron_trigger',
      errors,
      flatEntityMinimalInformation: {
        id: flatCronTriggerToValidate.id,
      },
    };
  }
}
