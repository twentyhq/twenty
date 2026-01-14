import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';

import { type WorkflowVersionWorkspaceEntity } from './workflow-version.workspace-entity';

export enum ManualTriggerAvailabilityType {
  GLOBAL = 'GLOBAL',
  SINGLE_RECORD = 'SINGLE_RECORD',
  BULK_RECORDS = 'BULK_RECORDS',
}

export class ManualTriggerWorkspaceEntity extends BaseWorkspaceEntity {
  workflowVersion: EntityRelation<WorkflowVersionWorkspaceEntity>;
  workflowVersionId: string;
  workflowId: string;
  workflowName: string;
  label: string;
  icon: string | null;
  isPinned: boolean | null;
  availabilityType: ManualTriggerAvailabilityType | null;
  availabilityObjectNameSingular: string | null;
}
