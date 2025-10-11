import { type FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';

export const FLAT_CRON_TRIGGER_EDITABLE_PROPERTIES = [
  'settings',
] as const satisfies (keyof FlatCronTrigger)[];
