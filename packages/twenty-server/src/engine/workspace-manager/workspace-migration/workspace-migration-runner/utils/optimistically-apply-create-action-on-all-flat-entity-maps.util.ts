import { assertUnreachable } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-and-related-entity-maps-through-mutation-or-throw.util';
import { type AllFlatWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';

export type OptimisticallyApplyCreateActionOnAllFlatEntityMapsArgs = {
  flatAction: AllFlatWorkspaceMigrationAction<'create'>;
  allFlatEntityMaps: AllFlatEntityMaps;
};

export const optimisticallyApplyCreateActionOnAllFlatEntityMaps = ({
  flatAction,
  allFlatEntityMaps,
}: OptimisticallyApplyCreateActionOnAllFlatEntityMapsArgs): AllFlatEntityMaps => {
  switch (flatAction.metadataName) {
    case 'fieldMetadata': {
      flatAction.flatFieldMetadatas.forEach((flatEntity) =>
        addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow({
          flatEntity,
          flatEntityAndRelatedMapsToMutate: allFlatEntityMaps,
          metadataName: flatAction.metadataName,
        }),
      );

      return allFlatEntityMaps;
    }
    case 'objectMetadata': {
      addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow({
        flatEntity: flatAction.flatEntity,
        flatEntityAndRelatedMapsToMutate: allFlatEntityMaps,
        metadataName: flatAction.metadataName,
      });

      flatAction.flatFieldMetadatas.forEach((flatField) =>
        addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow({
          flatEntity: flatField,
          flatEntityAndRelatedMapsToMutate: allFlatEntityMaps,
          metadataName: 'fieldMetadata',
        }),
      );

      return allFlatEntityMaps;
    }
    case 'view':
    case 'viewField':
    case 'viewGroup':
    case 'viewFieldGroup':
    case 'rowLevelPermissionPredicate':
    case 'rowLevelPermissionPredicateGroup':
    case 'viewFilterGroup':
    case 'index':
    case 'logicFunction':
    case 'viewFilter':
    case 'role':
    case 'roleTarget':
    case 'agent':
    case 'skill':
    case 'pageLayout':
    case 'pageLayoutWidget':
    case 'pageLayoutTab':
    case 'commandMenuItem':
    case 'frontComponent':
    case 'navigationMenuItem':
    case 'webhook': {
      addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow({
        flatEntity: flatAction.flatEntity,
        flatEntityAndRelatedMapsToMutate: allFlatEntityMaps,
        metadataName: flatAction.metadataName,
      });

      return allFlatEntityMaps;
    }
    default: {
      assertUnreachable(flatAction);
    }
  }
};
