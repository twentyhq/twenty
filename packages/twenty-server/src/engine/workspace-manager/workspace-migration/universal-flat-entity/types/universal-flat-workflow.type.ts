import { type WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatWorkflow = UniversalFlatEntityFrom<
  WorkflowEntity,
  'workflow'
>;
