import {
    type ActorMetadata,
    FieldMetadataType,
    type RichTextV2Metadata,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { type ChecklistWorkspaceEntity } from 'src/modules/checklist/standard-objects/checklist.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const TITLE_FIELD_NAME = 'title';

export const SEARCH_FIELDS_FOR_CHECKLIST_ITEM: FieldTypeAndNameMetadata[] = [
  { name: TITLE_FIELD_NAME, type: FieldMetadataType.TEXT },
];

/**
 * ChecklistItem Entity
 * Individual items within a checklist with document slots, compliance requirements, etc.
 */
export class ChecklistItemWorkspaceEntity extends BaseWorkspaceEntity {
  // Basic Info
  title: string;
  description: RichTextV2Metadata | null;

  // Status & Completion
  status: string; // 'pending' | 'in-progress' | 'completed' | 'blocked' | 'skipped' | 'na'
  isComplete: boolean;
  completedAt: Date | null;

  // Requirements
  isRequired: boolean;
  requiresDocument: boolean;
  requiresSignature: boolean;
  requiresApproval: boolean;

  // Document Info
  documentType: string | null; // 'contract' | 'disclosure' | 'addendum' | 'inspection' | 'appraisal' | 'other'
  documentName: string | null;
  documentUploaded: boolean;

  // Deadlines
  dueDate: Date | null;
  reminderDate: Date | null;

  // Compliance
  isComplianceItem: boolean;
  complianceCategory: string | null; // 'legal' | 'financial' | 'regulatory' | 'internal'
  complianceNotes: string | null;

  // Ordering & Grouping
  position: number;
  section: string | null; // Group items by section
  phase: string | null; // 'pre-contract' | 'under-contract' | 'closing' | 'post-closing'

  // Metadata
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  checklist: EntityRelation<ChecklistWorkspaceEntity>;
  checklistId: string;

  assignee: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  assigneeId: string | null;

  completedBy: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  completedById: string | null;

  attachments: EntityRelation<AttachmentWorkspaceEntity[]>;

  searchVector: string;
}
