import { FLAT_ROUTE_TRIGGER_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/route-trigger/constants/flat-route-trigger-editable-properties.constant';
import { type FlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';

export const FLAT_ROUTE_TRIGGER_PROPERTIES_TO_COMPARE = [
  ...FLAT_ROUTE_TRIGGER_EDITABLE_PROPERTIES,
] as const satisfies (keyof FlatRouteTrigger)[];
