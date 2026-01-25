import {
    type ActorMetadata,
    type AddressMetadata,
    type CurrencyMetadata,
    FieldMetadataType,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { type ChecklistWorkspaceEntity } from 'src/modules/checklist/standard-objects/checklist.workspace-entity';
import { type CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { type NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { type PropertyWorkspaceEntity } from 'src/modules/property/standard-objects/property.workspace-entity';
import { type TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { type TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';
const ADDRESS_FIELD_NAME = 'address';

export const SEARCH_FIELDS_FOR_TRANSACTION: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: ADDRESS_FIELD_NAME, type: FieldMetadataType.ADDRESS },
];

/**
 * Transaction Entity
 * Represents a real estate transaction (sale, purchase, lease, etc.)
 * This is the core entity for Transaction Coordinators and Agents
 */
export class TransactionWorkspaceEntity extends BaseWorkspaceEntity {
  // Basic Info
  name: string;
  transactionType: string; // 'buyer' | 'seller' | 'dual' | 'lease' | 'referral'
  status: string; // 'pending' | 'active' | 'under-contract' | 'closed' | 'cancelled'
  stage: string; // Custom pipeline stages
  position: number;

  // Property Info
  address: AddressMetadata;
  mlsNumber: string | null;

  // Financial
  purchasePrice: CurrencyMetadata | null;
  listPrice: CurrencyMetadata | null;
  commission: CurrencyMetadata | null;
  commissionPercent: number | null;

  // Key Dates
  listingDate: Date | null;
  contractDate: Date | null;
  closingDate: Date | null;
  expectedClosingDate: Date | null;
  inspectionDeadline: Date | null;
  appraisalDeadline: Date | null;
  financingDeadline: Date | null;

  // Progress
  checklistProgress: number; // 0-100 percentage
  documentsComplete: boolean;
  complianceComplete: boolean;

  // Metadata
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  property: EntityRelation<PropertyWorkspaceEntity> | null;
  propertyId: string | null;

  agent: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  agentId: string | null;

  transactionCoordinator: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  transactionCoordinatorId: string | null;

  buyer: EntityRelation<PersonWorkspaceEntity> | null;
  buyerId: string | null;

  seller: EntityRelation<PersonWorkspaceEntity> | null;
  sellerId: string | null;

  company: EntityRelation<CompanyWorkspaceEntity> | null;
  companyId: string | null;

  checklists: EntityRelation<ChecklistWorkspaceEntity[]>;
  favorites: EntityRelation<FavoriteWorkspaceEntity[]>;
  taskTargets: EntityRelation<TaskTargetWorkspaceEntity[]>;
  noteTargets: EntityRelation<NoteTargetWorkspaceEntity[]>;
  attachments: EntityRelation<AttachmentWorkspaceEntity[]>;
  timelineActivities: EntityRelation<TimelineActivityWorkspaceEntity[]>;

  searchVector: string;
}
