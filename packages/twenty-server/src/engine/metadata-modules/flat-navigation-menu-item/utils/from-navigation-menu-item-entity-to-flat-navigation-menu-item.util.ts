import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromNavigationMenuItemEntityToFlatNavigationMenuItem = (
  args: FromEntityToFlatEntityArgs<'navigationMenuItem'>,
): FlatNavigationMenuItem => {
  const { entity: navigationMenuItemEntity } = args;

  const navigationMenuItemEntityWithoutRelations = fromEntityToScalarEntity({
    metadataName: 'navigationMenuItem',
    entity: navigationMenuItemEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'navigationMenuItem',
      ...args,
    });

  return {
    ...navigationMenuItemEntityWithoutRelations,
    ...relationUniversalIdentifiers,
  };
};
