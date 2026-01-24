import { type RouteTriggerDTO } from 'src/engine/metadata-modules/route-trigger/dtos/route-trigger.dto';
import { type FlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';

export const fromFlatRouteTriggerToRouteTriggerDto = (
  flatRouteTrigger: FlatRouteTrigger,
): RouteTriggerDTO => ({
  id: flatRouteTrigger.id,
  path: flatRouteTrigger.path,
  isAuthRequired: flatRouteTrigger.isAuthRequired,
  httpMethod: flatRouteTrigger.httpMethod,
  forwardedRequestHeaders: flatRouteTrigger.forwardedRequestHeaders,
  createdAt: new Date(flatRouteTrigger.createdAt),
  updatedAt: new Date(flatRouteTrigger.updatedAt),
});
