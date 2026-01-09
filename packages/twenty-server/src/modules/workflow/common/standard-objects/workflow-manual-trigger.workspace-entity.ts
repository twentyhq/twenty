import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type ManualTriggerSettings } from 'src/modules/workflow/workflow-trigger/manual-trigger/constants/manual-trigger-settings';

import { type WorkflowVersionWorkspaceEntity } from './workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from './workflow.workspace-entity';

export class WorkflowManualTriggerWorkspaceEntity extends BaseWorkspaceEntity {
  workflowVersion: EntityRelation<WorkflowVersionWorkspaceEntity>;
  workflowVersionId: string;
  workflow: EntityRelation<WorkflowWorkspaceEntity>;
  workflowId: string;
  workflowName: string;
  settings: ManualTriggerSettings;
}
