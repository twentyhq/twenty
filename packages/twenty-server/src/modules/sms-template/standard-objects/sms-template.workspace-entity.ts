import {
    type ActorMetadata,
    FieldMetadataType,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_SMS_TEMPLATE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

/**
 * SmsTemplate Entity
 * Reusable SMS/Text message templates
 */
export class SmsTemplateWorkspaceEntity extends BaseWorkspaceEntity {
  // Basic Info
  name: string;

  // Content
  messageBody: string; // SMS content (160 char segments)
  characterCount: number;
  segmentCount: number; // How many SMS segments

  // Template Settings
  templateType: string; // 'reminder' | 'follow_up' | 'notification' | 'marketing' | 'custom'
  category: string | null;

  // Sharing & Visibility
  visibility: string; // 'private' | 'team' | 'company' | 'default'
  isDefault: boolean;
  isActive: boolean;

  // Variables
  variables: string | null; // JSON array of merge fields

  // Tracking
  usageCount: number;
  lastUsedAt: Date | null;

  // Compliance
  requiresOptIn: boolean;
  includesOptOut: boolean; // Must include STOP to unsubscribe

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
