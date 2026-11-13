import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatViewTab } from 'src/engine/metadata-modules/flat-view-tab/types/flat-view-tab.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromViewTabEntityToFlatViewTab = (
  args: FromEntityToFlatEntityArgs<'viewTab'>,
): FlatViewTab => {
  const { entity: viewTabEntity } = args;

  const viewTabScalarEntity = fromEntityToScalarEntity({
    metadataName: 'viewTab',
    entity: viewTabEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'viewTab',
      ...args,
    });

  return {
    ...viewTabScalarEntity,
    ...relationUniversalIdentifiers,
    viewFilterIds: viewTabEntity.viewFilters?.map(({ id }) => id) ?? [],
    viewFilterUniversalIdentifiers:
      viewTabEntity.viewFilters?.map(
        ({ universalIdentifier }) => universalIdentifier,
      ) ?? [],
  };
};
