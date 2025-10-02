import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { type UpdateRouteInput } from 'src/engine/metadata-modules/route/dtos/update-route.input';
import {
  RouteException,
  RouteExceptionCode,
} from 'src/engine/metadata-modules/route/exceptions/route.exception';
import { type FlatRoute } from 'src/engine/metadata-modules/route/types/flat-route.type';

export const fromUpdateRouteInputToFlatRouteToUpdateOrThrow = ({
  flatRouteMaps,
  updateRouteInput,
}: {
  flatRouteMaps: FlatEntityMaps<FlatRoute>;
  updateRouteInput: UpdateRouteInput;
}): FlatRoute => {
  const existingFlatRoute = flatRouteMaps.byId[updateRouteInput.id];

  if (!existingFlatRoute) {
    throw new RouteException(
      'Route not found',
      RouteExceptionCode.ROUTE_NOT_FOUND,
    );
  }

  return {
    ...existingFlatRoute,
    path: updateRouteInput.update.path,
    isAuthRequired: updateRouteInput.update.isAuthRequired,
    httpMethod: updateRouteInput.update.httpMethod,
    updatedAt: new Date(),
  };
};
