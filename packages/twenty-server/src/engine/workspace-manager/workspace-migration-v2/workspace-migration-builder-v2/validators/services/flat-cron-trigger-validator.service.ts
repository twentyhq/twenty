import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { CronTriggerExceptionCode } from 'src/engine/metadata-modules/cron-trigger/exceptions/cron-trigger.exception';
import { FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';
import { ALL_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-name.constant';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { fromWorkspaceMigrationUpdateActionToPartialEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-workspace-migration-update-action-to-partial-field-or-object-entity.util';

@Injectable()
export class FlatCronTriggerValidatorService {
  constructor() {}

  public validateFlatCronTriggerUpdate({
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMaps: optimisticFlatCronTriggerMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.cronTrigger
  >): FailedFlatEntityValidation<FlatCronTrigger> {
    const errors = [];

    const existingFlatCronTrigger =
      optimisticFlatCronTriggerMaps.byId[flatEntityId];

    if (!isDefined(existingFlatCronTrigger)) {
      errors.push({
        code: CronTriggerExceptionCode.CRON_TRIGGER_NOT_FOUND,
        message: t`Cron trigger not found`,
        userFriendlyMessage: msg`Cron trigger not found`,
      });
    } else {
      const updatedFlatCronTrigger = {
        ...existingFlatCronTrigger,
        ...fromWorkspaceMigrationUpdateActionToPartialEntity({
          updates: flatEntityUpdates,
        }),
      };

      const serverlessFunction =
        dependencyOptimisticFlatEntityMaps.flatServerlessFunctionMaps.byId[
          updatedFlatCronTrigger.serverlessFunctionId
        ];

      if (!isDefined(serverlessFunction)) {
        errors.push({
          code: CronTriggerExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
          message: t`Serverless function not found`,
          userFriendlyMessage: msg`Serverless function not found`,
        });
      }
    }

    return {
      type: 'update_cron_trigger',
      errors,
      flatEntityMinimalInformation: {
        id: flatEntityId,
      },
    };
  }

  public validateFlatCronTriggerDeletion({
    flatEntityToValidate: { id: cronTriggerIdToDelete },
    optimisticFlatEntityMaps: optimisticFlatCronTriggerMaps,
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.cronTrigger
  >): FailedFlatEntityValidation<FlatCronTrigger> {
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
    flatEntityToValidate: flatCronTriggerToValidate,
    optimisticFlatEntityMaps: optimisticFlatCronTriggerMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.cronTrigger>): Promise<
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
