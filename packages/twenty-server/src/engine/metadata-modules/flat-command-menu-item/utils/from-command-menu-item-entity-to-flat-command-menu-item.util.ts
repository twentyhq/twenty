import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { fromCommandMenuItemOverridesToUniversalOverrides } from 'src/engine/metadata-modules/flat-command-menu-item/utils/from-command-menu-item-overrides-to-universal-overrides.util';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-cache/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromCommandMenuItemEntityToFlatCommandMenuItem = (
  args: FromEntityToFlatEntityArgs<'commandMenuItem'>,
): FlatCommandMenuItem => {
  const {
    entity: commandMenuItemEntity,
    objectMetadataIdToUniversalIdentifierMap,
    pageLayoutIdToUniversalIdentifierMap,
  } = args;

  const commandMenuItemEntityWithoutRelations = removePropertiesFromRecord(
    commandMenuItemEntity,
    getMetadataEntityRelationProperties('commandMenuItem'),
  );

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'commandMenuItem',
      ...args,
    });

  const universalOverrides = isDefined(commandMenuItemEntity.overrides)
    ? fromCommandMenuItemOverridesToUniversalOverrides({
        overrides: commandMenuItemEntity.overrides,
        objectMetadataUniversalIdentifierById: Object.fromEntries(
          objectMetadataIdToUniversalIdentifierMap.entries(),
        ),
        pageLayoutUniversalIdentifierById: Object.fromEntries(
          pageLayoutIdToUniversalIdentifierMap.entries(),
        ),
        shouldThrowOnMissingIdentifier: false,
      })
    : null;

  return {
    ...commandMenuItemEntityWithoutRelations,
    createdAt: commandMenuItemEntity.createdAt.toISOString(),
    updatedAt: commandMenuItemEntity.updatedAt.toISOString(),
    universalIdentifier:
      commandMenuItemEntityWithoutRelations.universalIdentifier,
    ...relationUniversalIdentifiers,
    universalOverrides,
  };
};
