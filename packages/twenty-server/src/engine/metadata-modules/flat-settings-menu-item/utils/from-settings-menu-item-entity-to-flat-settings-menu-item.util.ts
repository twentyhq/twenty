import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatSettingsMenuItem } from 'src/engine/metadata-modules/flat-settings-menu-item/types/flat-settings-menu-item.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromSettingsMenuItemEntityToFlatSettingsMenuItem = (
  args: FromEntityToFlatEntityArgs<'settingsMenuItem'>,
): FlatSettingsMenuItem => {
  const { entity: settingsMenuItemEntity } = args;

  const settingsMenuItemScalarEntity = fromEntityToScalarEntity({
    metadataName: 'settingsMenuItem',
    entity: settingsMenuItemEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'settingsMenuItem',
      ...args,
    });

  return {
    ...settingsMenuItemScalarEntity,
    ...relationUniversalIdentifiers,
  };
};
