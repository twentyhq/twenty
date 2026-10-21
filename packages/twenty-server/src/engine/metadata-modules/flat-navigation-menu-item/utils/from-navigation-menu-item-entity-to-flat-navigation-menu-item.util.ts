import { fromConditionalDisplayToUniversalConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/from-conditional-display-to-universal-conditional-display.util';
import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

type FromNavigationMenuItemEntityToFlatNavigationMenuItemArgs =
  FromEntityToFlatEntityArgs<'navigationMenuItem'> & {
    fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
    roleUniversalIdentifierById: Partial<Record<string, string>>;
  };

export const fromNavigationMenuItemEntityToFlatNavigationMenuItem = (
  args: FromNavigationMenuItemEntityToFlatNavigationMenuItemArgs,
): FlatNavigationMenuItem => {
  const {
    entity: navigationMenuItemEntity,
    fieldMetadataUniversalIdentifierById,
    roleUniversalIdentifierById,
  } = args;

  const navigationMenuItemScalarEntity = fromEntityToScalarEntity({
    metadataName: 'navigationMenuItem',
    entity: navigationMenuItemEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'navigationMenuItem',
      ...args,
    });

  const universalConditionalDisplay =
    fromConditionalDisplayToUniversalConditionalDisplay({
      conditionalDisplay: navigationMenuItemScalarEntity.conditionalDisplay,
      fieldMetadataUniversalIdentifierById,
      roleUniversalIdentifierById,
    });

  return {
    ...navigationMenuItemScalarEntity,
    ...relationUniversalIdentifiers,
    universalConditionalDisplay,
  };
};
