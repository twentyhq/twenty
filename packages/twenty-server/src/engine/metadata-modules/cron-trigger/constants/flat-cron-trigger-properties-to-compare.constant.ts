import { FLAT_CRON_TRIGGER_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/cron-trigger/constants/flat-cron-trigger-editable-properties.constant';
import { type FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';

export const FLAT_CRON_TRIGGER_PROPERTIES_TO_COMPARE = [
  ...FLAT_CRON_TRIGGER_EDITABLE_PROPERTIES,
] as const satisfies (keyof FlatCronTrigger)[];
