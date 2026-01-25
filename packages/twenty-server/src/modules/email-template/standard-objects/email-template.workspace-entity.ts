import {
    type ActorMetadata,
    FieldMetadataType
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';
const SUBJECT_FIELD_NAME = 'subject';

export const SEARCH_FIELDS_FOR_EMAIL_TEMPLATE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: SUBJECT_FIELD_NAME, type: FieldMetadataType.TEXT },
];

/**
 * EmailTemplate Entity
 * Reusable email templates for campaigns, follow-ups, and automated emails
 */
export class EmailTemplateWorkspaceEntity extends BaseWorkspaceEntity {
  // Basic Info
  name: string;
  subject: string;

  // Content
  bodyHtml: string | null; // Full HTML content
  bodyText: string | null; // Plain text version
  bodyBlocks: string | null; // JSON for block-based editor
  previewText: string | null; // Email preview text

  // Template Settings
  templateType: string; // 'marketing' | 'transactional' | 'follow_up' | 'notification' | 'drip' | 'custom'
  category: string | null; // 'buyer' | 'seller' | 'mortgage' | 'general' | etc.

  // Sharing & Visibility
  visibility: string; // 'private' | 'team' | 'company' | 'default'
  isDefault: boolean; // Company default template
  isActive: boolean;

  // Variables & Personalization
  variables: string | null; // JSON array of available merge fields

  // Tracking
  usageCount: number;
  lastUsedAt: Date | null;

  // A/B Testing
  isVariant: boolean;
  variantOf: string | null; // Parent template ID
  variantName: string | null; // 'A' | 'B' | etc.

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
