import { FLAT_ROUTE_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/route/constants/flat-route-editable-properties.constant';
import { type FlatRoute } from 'src/engine/metadata-modules/route/types/flat-route.type';

export const FLAT_ROUTE_PROPERTIES_TO_COMPARE = [
  ...FLAT_ROUTE_EDITABLE_PROPERTIES,
] as const satisfies (keyof FlatRoute)[];
