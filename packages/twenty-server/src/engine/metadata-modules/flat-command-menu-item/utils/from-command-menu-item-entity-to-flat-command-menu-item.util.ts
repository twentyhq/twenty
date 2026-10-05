import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { fromCommandMenuItemOverridesToUniversalOverrides } from 'src/engine/metadata-modules/flat-command-menu-item/utils/from-command-menu-item-overrides-to-universal-overrides.util';
import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

type FromCommandMenuItemEntityToFlatCommandMenuItemArgs =
  FromEntityToFlatEntityArgs<'commandMenuItem'> & {
    objectMetadataUniversalIdentifierById: Partial<Record<string, string>>;
    pageLayoutUniversalIdentifierById: Partial<Record<string, string>>;
  };

export const fromCommandMenuItemEntityToFlatCommandMenuItem = (
  args: FromCommandMenuItemEntityToFlatCommandMenuItemArgs,
): FlatCommandMenuItem => {
  const {
    entity: commandMenuItemEntity,
    objectMetadataUniversalIdentifierById,
    pageLayoutUniversalIdentifierById,
  } = args;

  const commandMenuItemScalarEntity = fromEntityToScalarEntity({
    metadataName: 'commandMenuItem',
    entity: commandMenuItemEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'commandMenuItem',
      ...args,
    });

  const universalOverrides = isDefined(commandMenuItemEntity.overrides)
    ? fromCommandMenuItemOverridesToUniversalOverrides({
        overrides: commandMenuItemEntity.overrides,
        objectMetadataUniversalIdentifierById,
        pageLayoutUniversalIdentifierById,
        shouldThrowOnMissingIdentifier: false,
      })
    : null;

  return {
    ...commandMenuItemScalarEntity,
    ...relationUniversalIdentifiers,
    universalOverrides,
  };
};
