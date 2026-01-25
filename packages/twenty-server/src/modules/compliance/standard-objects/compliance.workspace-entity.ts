import {
    type ActorMetadata,
    FieldMetadataType,
    type RichTextV2Metadata,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_COMPLIANCE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

/**
 * Compliance Entity
 * Tracks compliance requirements, audits, and regulatory items
 */
export class ComplianceWorkspaceEntity extends BaseWorkspaceEntity {
  // Basic Info
  name: string;
  description: RichTextV2Metadata | null;

  // Type & Category
  complianceType: string; // 'license' | 'disclosure' | 'audit' | 'training' | 'policy' | 'regulation'
  category: string; // 'legal' | 'financial' | 'regulatory' | 'internal' | 'state' | 'federal'
  jurisdiction: string | null; // State or region if applicable

  // Status
  status: string; // 'pending' | 'in_progress' | 'compliant' | 'non_compliant' | 'expired' | 'waived'
  riskLevel: string; // 'low' | 'medium' | 'high' | 'critical'

  // Dates
  effectiveDate: Date | null;
  expirationDate: Date | null;
  dueDate: Date | null;
  completedDate: Date | null;
  lastReviewDate: Date | null;
  nextReviewDate: Date | null;

  // Requirements
  requiresDocument: boolean;
  requiresSignature: boolean;
  requiresTraining: boolean;
  requiresAudit: boolean;

  // Tracking
  documentUploaded: boolean;
  signatureObtained: boolean;
  trainingCompleted: boolean;
  auditPassed: boolean;

  // Notes & Evidence
  notes: RichTextV2Metadata | null;
  evidenceUrl: string | null;

  // Related Transaction/Entity
  relatedEntityType: string | null;
  relatedEntityId: string | null;

  // Metadata
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  owner: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  ownerId: string | null;

  assignee: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  assigneeId: string | null;

  reviewer: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  reviewerId: string | null;

  attachments: EntityRelation<AttachmentWorkspaceEntity[]>;
  favorites: EntityRelation<FavoriteWorkspaceEntity[]>;

  searchVector: string;
}
