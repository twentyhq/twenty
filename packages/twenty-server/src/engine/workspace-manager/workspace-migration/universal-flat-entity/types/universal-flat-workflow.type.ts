import { type UniversalFlatCommandMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-command-menu-item.type';
import { type UniversalFlatWorkflowVersion } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow-version.type';
import { type WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatWorkflow = UniversalFlatEntityFrom<
  WorkflowEntity,
  'workflow'
> & {
  flatUniversalWorkflowVersion?: UniversalFlatWorkflowVersion & { id: string };
  flatUniversalCommandMenuItem?: UniversalFlatCommandMenuItem;
};
