import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatSettingPage } from 'src/engine/metadata-modules/flat-setting-page/types/flat-setting-page.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromSettingPageEntityToFlatSettingPage = (
  args: FromEntityToFlatEntityArgs<'settingPage'>,
): FlatSettingPage => {
  const { entity: settingPageEntity } = args;

  const settingPageScalarEntity = fromEntityToScalarEntity({
    metadataName: 'settingPage',
    entity: settingPageEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'settingPage',
      ...args,
    });

  return {
    ...settingPageScalarEntity,
    ...relationUniversalIdentifiers,
  };
};
