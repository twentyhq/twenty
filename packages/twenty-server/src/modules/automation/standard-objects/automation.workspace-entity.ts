import {
    type ActorMetadata,
    FieldMetadataType,
    type RichTextV2Metadata,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_AUTOMATION: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

/**
 * Automation Entity
 * Defines triggers, conditions, and actions for workflow automation
 * Examples: Send email when deal stage changes, Create task when checklist item is overdue
 */
export class AutomationWorkspaceEntity extends BaseWorkspaceEntity {
  // Basic Info
  name: string;
  description: RichTextV2Metadata | null;

  // Status
  isActive: boolean;
  status: string; // 'active' | 'paused' | 'draft' | 'error'

  // Trigger Configuration
  triggerType: string; // 'record_created' | 'record_updated' | 'field_changed' | 'date_reached' | 'schedule' | 'manual' | 'webhook'
  triggerEntity: string | null; // 'transaction' | 'checklist' | 'task' | 'person' | etc.
  triggerField: string | null; // Which field triggers this (e.g., 'status', 'stage')
  triggerValue: string | null; // What value triggers this
  triggerConfig: string | null; // JSON config for complex triggers

  // Condition Configuration
  conditionsOperator: string; // 'AND' | 'OR'
  conditions: string | null; // JSON array of conditions

  // Action Configuration
  actionType: string; // 'send_email' | 'send_sms' | 'create_task' | 'update_record' | 'create_note' | 'notify' | 'webhook' | 'zapier'
  actionConfig: string | null; // JSON config for action
  actionDelay: number | null; // Delay in minutes before executing

  // Multi-Action Support
  actions: string | null; // JSON array of multiple actions

  // Execution Tracking
  lastExecutedAt: Date | null;
  executionCount: number;
  errorCount: number;
  lastError: string | null;

  // Scheduling (for scheduled triggers)
  scheduleType: string | null; // 'once' | 'daily' | 'weekly' | 'monthly' | 'custom'
  scheduleCron: string | null; // Cron expression for custom schedules
  nextScheduledRun: Date | null;

  // Metadata
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  owner: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  ownerId: string | null;

  favorites: EntityRelation<FavoriteWorkspaceEntity[]>;

  searchVector: string;
}
