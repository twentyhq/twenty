import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatWorkflowVersion } from 'src/engine/metadata-modules/flat-workflow-version/types/flat-workflow-version.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromWorkflowVersionEntityToFlatWorkflowVersion = (
  args: FromEntityToFlatEntityArgs<'workflowVersion'>,
): FlatWorkflowVersion => {
  const { entity: workflowVersionEntity } = args;

  const workflowVersionScalarEntity = fromEntityToScalarEntity({
    metadataName: 'workflowVersion',
    entity: workflowVersionEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'workflowVersion',
      ...args,
    });

  return {
    ...workflowVersionScalarEntity,
    ...relationUniversalIdentifiers,
  };
};
