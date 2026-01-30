import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';

export const fromDeleteFrontComponentInputToFlatFrontComponentOrThrow = ({
  flatFrontComponentMaps,
  frontComponentId,
}: {
  flatFrontComponentMaps: FlatEntityMaps<FlatFrontComponent>;
  frontComponentId: string;
}): FlatFrontComponent => {
  const existingFlatFrontComponent = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: frontComponentId,
    flatEntityMaps: flatFrontComponentMaps,
  });

  if (!isDefined(existingFlatFrontComponent)) {
    throw new FrontComponentException(
      'Front component not found',
      FrontComponentExceptionCode.FRONT_COMPONENT_NOT_FOUND,
    );
  }

  return existingFlatFrontComponent;
};
