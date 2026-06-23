import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromViewGroupEntityToFlatViewGroup = (
  args: FromEntityToFlatEntityArgs<'viewGroup'>,
): FlatViewGroup => {
  const { entity: viewGroupEntity } = args;

  const viewGroupEntityWithoutRelations = fromEntityToScalarEntity({
    metadataName: 'viewGroup',
    entity: viewGroupEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'viewGroup',
      ...args,
    });

  return {
    ...viewGroupEntityWithoutRelations,
    ...relationUniversalIdentifiers,
  };
};
