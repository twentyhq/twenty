import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { type UpdateCronTriggerInput } from 'src/engine/metadata-modules/cron-trigger/dtos/update-cron-trigger.input';
import {
  CronTriggerException,
  CronTriggerExceptionCode,
} from 'src/engine/metadata-modules/cron-trigger/exceptions/cron-trigger.exception';
import { type FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';

export const fromUpdateCronTriggerInputToFlatCronTriggerToUpdateOrThrow = ({
  flatCronTriggerMaps,
  updateCronTriggerInput,
}: {
  flatCronTriggerMaps: FlatEntityMaps<FlatCronTrigger>;
  updateCronTriggerInput: UpdateCronTriggerInput;
}): FlatCronTrigger => {
  const existingFlatCronTrigger =
    flatCronTriggerMaps.byId[updateCronTriggerInput.id];

  if (!existingFlatCronTrigger) {
    throw new CronTriggerException(
      'Cron trigger not found',
      CronTriggerExceptionCode.CRON_TRIGGER_NOT_FOUND,
    );
  }

  return {
    ...existingFlatCronTrigger,
    settings: updateCronTriggerInput.settings,
    updatedAt: new Date(),
  };
};
