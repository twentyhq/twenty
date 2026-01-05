import { type AllMetadataName } from 'twenty-shared/metadata';
import { assertUnreachable } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-and-related-entity-maps-through-mutation-or-throw.util';

type CreateAction<TMetadataName extends AllMetadataName> =
  AllFlatEntityTypesByMetadataName[TMetadataName]['actions']['create'];

export type OptimisticallyApplyCreateActionOnAllFlatEntityMapsArgs<
  TMetadataName extends AllMetadataName,
> = {
  action: CreateAction<TMetadataName>;
  allFlatEntityMaps: AllFlatEntityMaps;
};

export const optimisticallyApplyCreateActionOnAllFlatEntityMaps = <
  TMetadataName extends AllMetadataName,
>({
  action,
  allFlatEntityMaps,
}: OptimisticallyApplyCreateActionOnAllFlatEntityMapsArgs<TMetadataName>): AllFlatEntityMaps => {
  switch (action.metadataName) {
    case 'fieldMetadata': {
      action.flatFieldMetadatas.forEach((flatEntity) =>
        addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow({
          flatEntity,
          flatEntityAndRelatedMapsToMutate: allFlatEntityMaps,
          metadataName: action.metadataName,
        }),
      );

      return allFlatEntityMaps;
    }
    case 'objectMetadata': {
      addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow({
        flatEntity: action.flatEntity,
        flatEntityAndRelatedMapsToMutate: allFlatEntityMaps,
        metadataName: action.metadataName,
      });

      action.flatFieldMetadatas.forEach((flatField) =>
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
    case 'rowLevelPermissionPredicate':
    case 'rowLevelPermissionPredicateGroup':
    case 'viewFilterGroup':
    case 'index':
    case 'serverlessFunction':
    case 'cronTrigger':
    case 'databaseEventTrigger':
    case 'routeTrigger':
    case 'viewFilter':
    case 'role':
    case 'roleTarget':
    case 'agent':
    case 'skill':
    case 'pageLayout':
    case 'pageLayoutWidget':
    case 'pageLayoutTab': {
      addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow({
        flatEntity: action.flatEntity,
        flatEntityAndRelatedMapsToMutate: allFlatEntityMaps,
        metadataName: action.metadataName,
      });

      return allFlatEntityMaps;
    }
    default: {
      assertUnreachable(action);
    }
  }
};
