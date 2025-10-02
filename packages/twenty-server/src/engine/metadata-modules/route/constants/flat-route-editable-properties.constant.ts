import { type FlatRoute } from 'src/engine/metadata-modules/route/types/flat-route.type';

export const FLAT_ROUTE_EDITABLE_PROPERTIES = [
  'path',
  'isAuthRequired',
  'httpMethod',
] as const satisfies (keyof FlatRoute)[];
