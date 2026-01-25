import {
    type ActorMetadata,
    FieldMetadataType,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_TIMELINE_DATE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

/**
 * TimelineDate Entity
 * Key dates in a transaction timeline (auto-populated based on contract date)
 * Texas Real Estate Standard: Contract to Close typically 30-45 days
 */
export class TimelineDateWorkspaceEntity extends BaseWorkspaceEntity {
  // Basic Info
  name: string;
  description: string | null;

  // Related Transaction
  transactionId: string;
  transactionFolderId: string | null;

  // Date Configuration
  dateType: string; // See DATE_TYPES below
  category: string; // 'contract' | 'inspection' | 'financing' | 'title' | 'closing' | 'post_closing'

  // Actual Dates
  scheduledDate: Date;
  completedDate: Date | null;

  // Calculated from Contract Date
  daysFromContract: number; // e.g., +7 means 7 days after contract
  daysBeforeClosing: number | null; // e.g., -3 means 3 days before closing

  // Status
  status: string; // 'upcoming' | 'due_today' | 'overdue' | 'completed' | 'skipped' | 'na'
  isComplete: boolean;
  isRequired: boolean;
  isMilestone: boolean; // Major milestone in the process

  // Dependencies
  dependsOnDateId: string | null; // This date depends on another date
  blockedByDateId: string | null; // This date is blocked by another

  // Reminders
  reminderDays: number | null; // Days before to send reminder
  reminderSent: boolean;
  reminderSentAt: Date | null;

  // Associated Task/Checklist Item
  taskId: string | null;
  checklistItemId: string | null;

  // Visual
  color: string | null; // For flowchart visualization
  icon: string | null;

  // Ordering
  position: number;
  phaseOrder: number; // Order within the phase

  // Metadata
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  assignee: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  assigneeId: string | null;

  completedBy: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  completedById: string | null;

  searchVector: string;
}

/**
 * Texas Real Estate Standard Timeline Dates
 * These are auto-populated when a transaction is created
 */
export const TEXAS_REAL_ESTATE_TIMELINE_DATES = [
  // Contract Phase (Day 0)
  {
    name: 'Contract Executed',
    dateType: 'contract_executed',
    category: 'contract',
    daysFromContract: 0,
    isRequired: true,
    isMilestone: true,
  },
  {
    name: 'Earnest Money Due',
    dateType: 'earnest_money_due',
    category: 'contract',
    daysFromContract: 3,
    isRequired: true,
    isMilestone: false,
  },
  {
    name: 'Option Period Ends',
    dateType: 'option_period_ends',
    category: 'inspection',
    daysFromContract: 7,
    isRequired: true,
    isMilestone: true,
  },

  // Inspection Phase (Days 1-10)
  {
    name: 'Schedule Home Inspection',
    dateType: 'schedule_inspection',
    category: 'inspection',
    daysFromContract: 1,
    isRequired: true,
    isMilestone: false,
  },
  {
    name: 'Home Inspection',
    dateType: 'home_inspection',
    category: 'inspection',
    daysFromContract: 5,
    isRequired: true,
    isMilestone: false,
  },
  {
    name: 'Request Repairs (Amendment)',
    dateType: 'request_repairs',
    category: 'inspection',
    daysFromContract: 6,
    isRequired: false,
    isMilestone: false,
  },

  // Financing Phase (Days 1-21)
  {
    name: 'Loan Application Submitted',
    dateType: 'loan_application',
    category: 'financing',
    daysFromContract: 3,
    isRequired: true,
    isMilestone: false,
  },
  {
    name: 'Appraisal Ordered',
    dateType: 'appraisal_ordered',
    category: 'financing',
    daysFromContract: 5,
    isRequired: true,
    isMilestone: false,
  },
  {
    name: 'Appraisal Completed',
    dateType: 'appraisal_completed',
    category: 'financing',
    daysFromContract: 14,
    isRequired: true,
    isMilestone: true,
  },
  {
    name: 'Loan Approval',
    dateType: 'loan_approval',
    category: 'financing',
    daysFromContract: 21,
    isRequired: true,
    isMilestone: true,
  },

  // Title Phase (Days 5-25)
  {
    name: 'Title Commitment Received',
    dateType: 'title_commitment',
    category: 'title',
    daysFromContract: 10,
    isRequired: true,
    isMilestone: false,
  },
  {
    name: 'Survey Ordered',
    dateType: 'survey_ordered',
    category: 'title',
    daysFromContract: 5,
    isRequired: false,
    isMilestone: false,
  },
  {
    name: 'Survey Received',
    dateType: 'survey_received',
    category: 'title',
    daysFromContract: 18,
    isRequired: false,
    isMilestone: false,
  },
  {
    name: 'Title Objections Due',
    dateType: 'title_objections',
    category: 'title',
    daysFromContract: 15,
    isRequired: true,
    isMilestone: false,
  },

  // Closing Phase (Days 25-30)
  {
    name: 'Clear to Close',
    dateType: 'clear_to_close',
    category: 'closing',
    daysFromContract: 25,
    isRequired: true,
    isMilestone: true,
  },
  {
    name: 'Final Walkthrough',
    dateType: 'final_walkthrough',
    category: 'closing',
    daysFromContract: 29,
    isRequired: true,
    isMilestone: false,
  },
  {
    name: 'Closing Day',
    dateType: 'closing_day',
    category: 'closing',
    daysFromContract: 30,
    isRequired: true,
    isMilestone: true,
  },
  {
    name: 'Funding',
    dateType: 'funding',
    category: 'closing',
    daysFromContract: 30,
    isRequired: true,
    isMilestone: true,
  },

  // Post-Closing (Days 30+)
  {
    name: 'Keys Released',
    dateType: 'keys_released',
    category: 'post_closing',
    daysFromContract: 30,
    isRequired: true,
    isMilestone: true,
  },
  {
    name: 'Recording Confirmed',
    dateType: 'recording_confirmed',
    category: 'post_closing',
    daysFromContract: 32,
    isRequired: true,
    isMilestone: false,
  },
  {
    name: 'Commission Paid',
    dateType: 'commission_paid',
    category: 'post_closing',
    daysFromContract: 33,
    isRequired: true,
    isMilestone: false,
  },
];
