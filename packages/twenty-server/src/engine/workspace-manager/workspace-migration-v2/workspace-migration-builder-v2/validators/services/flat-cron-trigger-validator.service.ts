import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { CronTriggerExceptionCode } from 'src/engine/metadata-modules/cron-trigger/exceptions/cron-trigger.exception';
import { FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export type CronTriggerRelatedFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  'flatCronTriggerMaps'
>;

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
  }: CronTriggerValidationArgs): FailedFlatEntityValidation<FlatCronTrigger> {
    const errors = [];

    const existingFlatCronTrigger =
      optimisticFlatCronTriggerMaps.byId[updatedFlatCronTrigger.id];

    if (!isDefined(existingFlatCronTrigger)) {
      errors.push({
        code: CronTriggerExceptionCode.CRON_TRIGGER_NOT_FOUND,
        message: t`Cron trigger not found`,
        userFriendlyMessage: t`Cron trigger not found`,
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
        userFriendlyMessage: t`Cron trigger not found`,
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
        userFriendlyMessage: t`Cron trigger already exists`,
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
