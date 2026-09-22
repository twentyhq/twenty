import { type WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatWorkflowVersion = UniversalFlatEntityFrom<
  WorkflowVersionEntity,
  'workflowVersion'
>;
