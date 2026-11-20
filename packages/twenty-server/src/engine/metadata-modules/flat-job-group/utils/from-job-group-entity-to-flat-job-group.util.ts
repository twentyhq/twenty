import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatJobGroup } from 'src/engine/metadata-modules/flat-job-group/types/flat-job-group.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromJobGroupEntityToFlatJobGroup = (
  args: FromEntityToFlatEntityArgs<'jobGroup'>,
): FlatJobGroup => {
  const { entity: jobGroupEntity } = args;

  const jobGroupScalarEntity = fromEntityToScalarEntity({
    metadataName: 'jobGroup',
    entity: jobGroupEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'jobGroup',
      ...args,
    });

  return {
    ...jobGroupScalarEntity,
    ...relationUniversalIdentifiers,
  };
};
