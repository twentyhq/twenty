import {
    type ActorMetadata,
    FieldMetadataType,
    type RichTextV2Metadata,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type EmailTemplateWorkspaceEntity } from 'src/modules/email-template/standard-objects/email-template.workspace-entity';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_CAMPAIGN: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

/**
 * Campaign Entity
 * Email/SMS marketing campaigns with scheduling and analytics
 */
export class CampaignWorkspaceEntity extends BaseWorkspaceEntity {
  // Basic Info
  name: string;
  description: RichTextV2Metadata | null;

  // Campaign Type
  campaignType: string; // 'email' | 'sms' | 'drip' | 'newsletter' | 'announcement'

  // Status
  status: string; // 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'

  // Audience
  audienceType: string; // 'all' | 'segment' | 'list' | 'manual'
  audienceFilter: string | null; // JSON filter criteria
  recipientCount: number;

  // Schedule
  scheduledAt: Date | null;
  sentAt: Date | null;
  completedAt: Date | null;

  // Drip Settings (for drip campaigns)
  isDrip: boolean;
  dripSteps: string | null; // JSON array of drip steps
  dripInterval: number | null; // days between emails

  // Analytics
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
  repliedCount: number;

  // Rates (calculated)
  openRate: number | null;
  clickRate: number | null;
  bounceRate: number | null;
  unsubscribeRate: number | null;

  // A/B Testing
  isABTest: boolean;
  winningVariant: string | null;

  // Metadata
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  owner: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  ownerId: string | null;

  emailTemplate: EntityRelation<EmailTemplateWorkspaceEntity> | null;
  emailTemplateId: string | null;

  favorites: EntityRelation<FavoriteWorkspaceEntity[]>;

  searchVector: string;
}
