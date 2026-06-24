import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AutomatedTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';

import { type WorkflowWorkspaceEntity } from './workflow.workspace-entity';

export enum AutomatedTriggerType {
  DATABASE_EVENT = 'DATABASE_EVENT',
  CRON = 'CRON',
}

export const SEARCH_FIELDS_FOR_WORKFLOW_AUTOMATED_TRIGGER: FieldTypeAndNameMetadata[] =
  [{ name: 'id', type: FieldMetadataType.UUID }];

export class WorkflowAutomatedTriggerWorkspaceEntity extends BaseWorkspaceEntity {
  type: AutomatedTriggerType;
  settings: AutomatedTriggerSettings;
  workflow: EntityRelation<WorkflowWorkspaceEntity>;
  workflowId: string;
}
