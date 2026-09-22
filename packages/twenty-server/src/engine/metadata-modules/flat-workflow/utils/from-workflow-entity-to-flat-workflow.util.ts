import { fromEntityToScalarEntity } from 'src/engine/metadata-modules/flat-entity/utils/from-entity-to-scalar-entity.util';
import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';
import { resolveManyToOneRelationIdsToUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-many-to-one-relation-ids-to-universal-identifiers.util';

export const fromWorkflowEntityToFlatWorkflow = (
  args: FromEntityToFlatEntityArgs<'workflow'>,
): FlatWorkflow => {
  const { entity: workflowEntity } = args;

  const workflowScalarEntity = fromEntityToScalarEntity({
    metadataName: 'workflow',
    entity: workflowEntity,
  });

  const relationUniversalIdentifiers =
    resolveManyToOneRelationIdsToUniversalIdentifiers({
      metadataName: 'workflow',
      ...args,
    });

  return {
    ...workflowScalarEntity,
    ...relationUniversalIdentifiers,
  };
};
