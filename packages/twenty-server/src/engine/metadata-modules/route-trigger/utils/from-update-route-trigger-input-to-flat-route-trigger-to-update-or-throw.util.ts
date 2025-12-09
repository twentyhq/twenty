import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type UpdateRouteTriggerInput } from 'src/engine/metadata-modules/route-trigger/dtos/update-route-trigger.input';
import {
  RouteTriggerException,
  RouteTriggerExceptionCode,
} from 'src/engine/metadata-modules/route-trigger/exceptions/route-trigger.exception';
import { type FlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';

export const fromUpdateRouteTriggerInputToFlatRouteTriggerToUpdateOrThrow = ({
  flatRouteTriggerMaps,
  updateRouteTriggerInput,
}: {
  flatRouteTriggerMaps: FlatEntityMaps<FlatRouteTrigger>;
  updateRouteTriggerInput: UpdateRouteTriggerInput;
}): FlatRouteTrigger => {
  const existingFlatRouteTrigger =
    flatRouteTriggerMaps.byId[updateRouteTriggerInput.id];

  if (!existingFlatRouteTrigger) {
    throw new RouteTriggerException(
      'Route not found',
      RouteTriggerExceptionCode.ROUTE_NOT_FOUND,
    );
  }

  return {
    ...existingFlatRouteTrigger,
    updatedAt: new Date().toISOString(),
    path: updateRouteTriggerInput.update.path,
    isAuthRequired: updateRouteTriggerInput.update.isAuthRequired,
    httpMethod: updateRouteTriggerInput.update.httpMethod,
  };
};
