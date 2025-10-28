import { type FlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';

export const FLAT_ROUTE_TRIGGER_EDITABLE_PROPERTIES = [
  'path',
  'isAuthRequired',
  'httpMethod',
] as const satisfies (keyof FlatRouteTrigger)[];
