import { v4 } from 'uuid';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatFrontComponentMaps } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component-maps.type';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';
import { STANDARD_FRONT_COMPONENTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-front-component.constant';
import { createStandardFrontComponentFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/front-component/create-standard-front-component-flat-metadata.util';

const STANDARD_FRONT_COMPONENT_NAMES = Object.keys(
  STANDARD_FRONT_COMPONENTS,
) as Array<keyof typeof STANDARD_FRONT_COMPONENTS>;

export const buildStandardFlatFrontComponentMaps = ({
  now,
  workspaceId,
  twentyStandardApplicationId,
}: {
  now: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  dependencyFlatEntityMaps: undefined;
}): FlatFrontComponentMaps => {
  const flatFrontComponentMaps: FlatFrontComponentMaps =
    createEmptyFlatEntityMaps();

  for (const frontComponentName of STANDARD_FRONT_COMPONENT_NAMES) {
    const flatFrontComponent = createStandardFrontComponentFlatMetadata({
      frontComponentName,
      frontComponentId: v4(),
      workspaceId,
      twentyStandardApplicationId,
      now,
    });

    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity: flatFrontComponent,
      flatEntityMapsToMutate: flatFrontComponentMaps,
    });
  }

  return flatFrontComponentMaps;
};
