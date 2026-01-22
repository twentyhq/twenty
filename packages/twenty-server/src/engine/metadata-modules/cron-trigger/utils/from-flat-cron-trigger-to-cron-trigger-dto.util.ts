import { type CronTriggerDTO } from 'src/engine/metadata-modules/cron-trigger/dtos/cron-trigger.dto';
import { type FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';

export const fromFlatCronTriggerToCronTriggerDto = (
  flatCronTrigger: FlatCronTrigger,
): CronTriggerDTO => ({
  id: flatCronTrigger.id,
  settings: flatCronTrigger.settings,
  createdAt: new Date(flatCronTrigger.createdAt),
  updatedAt: new Date(flatCronTrigger.updatedAt),
});
