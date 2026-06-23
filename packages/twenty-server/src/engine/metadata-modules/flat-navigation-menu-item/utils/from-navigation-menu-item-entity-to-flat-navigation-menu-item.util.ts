import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromNavigationMenuItemEntityToFlatNavigationMenuItem = (
  args: FromEntityToFlatEntityArgs<'navigationMenuItem'>,
): FlatNavigationMenuItem => {
  const { entity: navigationMenuItemEntity } = args;

  const navigationMenuItemEntityWithoutRelations = removePropertiesFromRecord(
    navigationMenuItemEntity,
    getMetadataEntityRelationProperties('navigationMenuItem'),
  );

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'navigationMenuItem',
      ...args,
    });

  return {
    ...navigationMenuItemEntityWithoutRelations,
    createdAt: navigationMenuItemEntity.createdAt.toISOString(),
    updatedAt: navigationMenuItemEntity.updatedAt.toISOString(),
    universalIdentifier:
      navigationMenuItemEntityWithoutRelations.universalIdentifier,
    ...relationUniversalIdentifiers,
  };
};
