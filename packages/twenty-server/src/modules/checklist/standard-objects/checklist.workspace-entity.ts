import {
    type ActorMetadata,
    FieldMetadataType,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type ChecklistItemWorkspaceEntity } from 'src/modules/checklist-item/standard-objects/checklist-item.workspace-entity';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_CHECKLIST: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

/**
 * Checklist Entity
 * Templates for transaction checklists (Buyer, Seller, Mortgage, Compliance, etc.)
 */
export class ChecklistWorkspaceEntity extends BaseWorkspaceEntity {
  // Basic Info
  name: string;
  description: string | null;

  // Type & Category
  checklistType: string; // 'buyer' | 'seller' | 'mortgage' | 'lease' | 'compliance' | 'custom'
  category: string | null; // 'pre-contract' | 'under-contract' | 'closing' | 'post-closing'

  // Template Settings
  isTemplate: boolean; // true = reusable template, false = instance
  templateId: string | null; // reference to template if this is an instance

  // Progress
  totalItems: number;
  completedItems: number;
  progressPercent: number; // 0-100

  // Status
  status: string; // 'not-started' | 'in-progress' | 'completed' | 'blocked'
  dueDate: Date | null;
  completedDate: Date | null;

  // Ordering
  position: number;

  // Metadata
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  owner: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  ownerId: string | null;

  assignee: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  assigneeId: string | null;

  items: EntityRelation<ChecklistItemWorkspaceEntity[]>;
  favorites: EntityRelation<FavoriteWorkspaceEntity[]>;

  searchVector: string;
}
