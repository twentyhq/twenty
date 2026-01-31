import { type AllMetadataName } from 'twenty-shared/metadata';
import { assertUnreachable } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-and-related-entity-maps-through-mutation-or-throw.util';
import { addFlatNavigationMenuItemToMapsAndUpdateIndex } from 'src/engine/metadata-modules/flat-navigation-menu-item/utils/add-flat-navigation-menu-item-to-maps-and-update-index.util';
import { type FlatCreateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import { type FlatCreateObjectAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object/types/workspace-migration-object-action';

type FlatCreateAction<TMetadataName extends AllMetadataName> =
  AllFlatEntityTypesByMetadataName[TMetadataName]['flatActions']['create'];

export type OptimisticallyApplyCreateActionOnAllFlatEntityMapsArgs<
  TMetadataName extends AllMetadataName,
> = {
  flatAction: FlatCreateAction<TMetadataName>;
  allFlatEntityMaps: AllFlatEntityMaps;
};

export const optimisticallyApplyCreateActionOnAllFlatEntityMaps = <
  TMetadataName extends AllMetadataName,
>({
  flatAction,
  allFlatEntityMaps,
}: OptimisticallyApplyCreateActionOnAllFlatEntityMapsArgs<TMetadataName>): AllFlatEntityMaps => {
  switch (flatAction.metadataName) {
    case 'view':
    case 'viewField':
    case 'viewGroup':
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
    case 'webhook': {
      addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow({
        flatEntity: flatAction.flatEntity,
        flatEntityAndRelatedMapsToMutate: allFlatEntityMaps,
        metadataName: flatAction.metadataName,
      });

      return allFlatEntityMaps;
    }
    case 'fieldMetadata': {
      const fieldAction = flatAction as unknown as FlatCreateFieldAction;

      for (const flatFieldMetadata of fieldAction.flatFieldMetadatas) {
        addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow({
          flatEntity: flatFieldMetadata,
          flatEntityAndRelatedMapsToMutate: allFlatEntityMaps,
          metadataName: 'fieldMetadata',
        });
      }

      return allFlatEntityMaps;
    }
    case 'objectMetadata': {
      const objectAction = flatAction as unknown as FlatCreateObjectAction;

      addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow({
        flatEntity: objectAction.flatEntity,
        flatEntityAndRelatedMapsToMutate: allFlatEntityMaps,
        metadataName: 'objectMetadata',
      });

      for (const flatFieldMetadata of objectAction.flatFieldMetadatas) {
        addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow({
          flatEntity: flatFieldMetadata,
          flatEntityAndRelatedMapsToMutate: allFlatEntityMaps,
          metadataName: 'fieldMetadata',
        });
      }

      return allFlatEntityMaps;
    }
    case 'navigationMenuItem': {
      addFlatNavigationMenuItemToMapsAndUpdateIndex({
        flatNavigationMenuItem: flatAction.flatEntity,
        flatNavigationMenuItemMaps:
          allFlatEntityMaps.flatNavigationMenuItemMaps,
      });

      return allFlatEntityMaps;
    }
    default: {
      assertUnreachable(flatAction);
    }
  }
};
