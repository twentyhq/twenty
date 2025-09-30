import { type FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';

export type FlatCronTriggerPropertiesToCompare = keyof Pick<
  FlatCronTrigger,
  'settings'
>;
