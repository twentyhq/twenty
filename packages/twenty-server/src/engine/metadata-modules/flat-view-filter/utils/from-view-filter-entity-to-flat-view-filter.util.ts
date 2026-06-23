import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromViewFilterEntityToFlatViewFilter = (
  args: FromEntityToFlatEntityArgs<'viewFilter'>,
): FlatViewFilter => {
  const { entity: viewFilterEntity } = args;

  const viewFilterEntityWithoutRelations = fromEntityToScalarEntity({
    metadataName: 'viewFilter',
    entity: viewFilterEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'viewFilter',
      ...args,
    });

  return {
    ...viewFilterEntityWithoutRelations,
    ...relationUniversalIdentifiers,
  };
};
