import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { AutomatedTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';

import { WorkflowWorkspaceEntity } from './workflow.workspace-entity';

export enum AutomatedTriggerType {
  DATABASE_EVENT = 'DATABASE_EVENT',
  CRON = 'CRON',
}

export class WorkflowAutomatedTriggerWorkspaceEntity extends BaseWorkspaceEntity {
  type: AutomatedTriggerType;
  settings: AutomatedTriggerSettings;
  workflow: Relation<WorkflowWorkspaceEntity>;
  workflowId: string;
}
