import { type STANDARD_OBJECTS } from '@/metadata/constants/standard-object.constant';

export const DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS = [
  'timelineActivity',
  'favorite',
  'attachment',
  'noteTarget',
  'taskTarget',
] as const satisfies (keyof typeof STANDARD_OBJECTS)[];
