import { type AutomatedTriggerType } from 'src/engine/core-modules/workflow/enums/automated-trigger-type.enum';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AutomatedTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';

import { type WorkflowWorkspaceEntity } from './workflow.workspace-entity';

export class WorkflowAutomatedTriggerWorkspaceEntity extends BaseWorkspaceEntity {
  type: AutomatedTriggerType;
  settings: AutomatedTriggerSettings;
  workflow: EntityRelation<WorkflowWorkspaceEntity>;
  workflowId: string;
}
