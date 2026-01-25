import {
    type ActorMetadata,
    FieldMetadataType,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const TITLE_FIELD_NAME = 'title';

export const SEARCH_FIELDS_FOR_NOTIFICATION: FieldTypeAndNameMetadata[] = [
  { name: TITLE_FIELD_NAME, type: FieldMetadataType.TEXT },
];

/**
 * Notification Entity
 * Tracks all notifications sent to users (in-app, email, SMS, push)
 */
export class NotificationWorkspaceEntity extends BaseWorkspaceEntity {
  // Content
  title: string;
  message: string | null;

  // Type & Channel
  notificationType: string; // 'task_due' | 'deal_update' | 'checklist_complete' | 'document_uploaded' | 'mention' | 'reminder' | 'system'
  channel: string; // 'in_app' | 'email' | 'sms' | 'push'
  priority: string; // 'low' | 'normal' | 'high' | 'urgent'

  // Status
  status: string; // 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  isRead: boolean;
  readAt: Date | null;

  // Delivery Info
  sentAt: Date | null;
  deliveredAt: Date | null;
  failedAt: Date | null;
  failureReason: string | null;

  // Related Entity
  relatedEntityType: string | null; // 'transaction' | 'task' | 'checklist' | etc.
  relatedEntityId: string | null;

  // Action
  actionUrl: string | null; // Deep link to take action
  actionLabel: string | null; // Button text

  // Grouping
  category: string | null; // For grouping notifications

  // Metadata
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  recipient: EntityRelation<WorkspaceMemberWorkspaceEntity>;
  recipientId: string;

  sender: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  senderId: string | null;

  searchVector: string;
}
