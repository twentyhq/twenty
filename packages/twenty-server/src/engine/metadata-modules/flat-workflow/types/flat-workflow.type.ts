import { type WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';

export type FlatWorkflow = FlatEntityFrom<WorkflowEntity>;
