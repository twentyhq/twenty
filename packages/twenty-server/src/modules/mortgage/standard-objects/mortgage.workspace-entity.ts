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
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { type NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { type PropertyWorkspaceEntity } from 'src/modules/property/standard-objects/property.workspace-entity';
import { type TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { type TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const BORROWER_NAME_FIELD_NAME = 'borrowerName';

export const SEARCH_FIELDS_FOR_MORTGAGE: FieldTypeAndNameMetadata[] = [
  { name: BORROWER_NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

/**
 * Mortgage Entity
 * Tracks mortgage/loan applications and processing
 */
export class MortgageWorkspaceEntity extends BaseWorkspaceEntity {
  // Borrower Info
  borrowerName: string;
  coBorrowerName: string | null;

  // Property Info
  propertyAddress: AddressMetadata;
  propertyType: string | null; // 'single_family' | 'condo' | 'multi_family' | 'investment'
  occupancyType: string | null; // 'primary' | 'secondary' | 'investment'

  // Loan Details
  loanType: string; // 'conventional' | 'fha' | 'va' | 'usda' | 'jumbo' | 'other'
  loanPurpose: string; // 'purchase' | 'refinance' | 'cash_out' | 'heloc'
  loanAmount: CurrencyMetadata | null;
  purchasePrice: CurrencyMetadata | null;
  downPayment: CurrencyMetadata | null;
  downPaymentPercent: number | null;
  interestRate: number | null;
  loanTerm: number | null; // in months (e.g., 360 for 30 years)

  // Status & Stage
  status: string; // 'application' | 'processing' | 'underwriting' | 'approved' | 'denied' | 'closed' | 'cancelled'
  stage: string; // Custom pipeline stages

  // Key Dates
  applicationDate: Date | null;
  preApprovalDate: Date | null;
  submittedToUnderwritingDate: Date | null;
  approvalDate: Date | null;
  clearToCloseDate: Date | null;
  closingDate: Date | null;
  fundingDate: Date | null;

  // Deadlines
  lockExpirationDate: Date | null;
  appraisalDeadline: Date | null;
  conditionsDeadline: Date | null;

  // Tracking
  conditionsCount: number;
  conditionsCleared: number;
  documentsRequired: number;
  documentsReceived: number;

  // Financial Details
  monthlyPayment: CurrencyMetadata | null;
  pmiAmount: CurrencyMetadata | null;
  closingCosts: CurrencyMetadata | null;

  // Lender Info
  lenderName: string | null;
  lenderContact: string | null;
  loanNumber: string | null;

  // Metadata
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  property: EntityRelation<PropertyWorkspaceEntity> | null;
  propertyId: string | null;

  borrower: EntityRelation<PersonWorkspaceEntity> | null;
  borrowerId: string | null;

  coBorrower: EntityRelation<PersonWorkspaceEntity> | null;
  coBorrowerId: string | null;

  loanOfficer: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  loanOfficerId: string | null;

  processor: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  processorId: string | null;

  favorites: EntityRelation<FavoriteWorkspaceEntity[]>;
  taskTargets: EntityRelation<TaskTargetWorkspaceEntity[]>;
  noteTargets: EntityRelation<NoteTargetWorkspaceEntity[]>;
  attachments: EntityRelation<AttachmentWorkspaceEntity[]>;
  timelineActivities: EntityRelation<TimelineActivityWorkspaceEntity[]>;

  searchVector: string;
}
