import {
    type ActorMetadata,
    FieldMetadataType,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_TRANSACTION_DOCUMENT: FieldTypeAndNameMetadata[] =
  [{ name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT }];

/**
 * TransactionDocument Entity
 * Documents within a transaction folder with e-signature tracking
 */
export class TransactionDocumentWorkspaceEntity extends BaseWorkspaceEntity {
  // Basic Info
  name: string;
  description: string | null;

  // File Info
  fileName: string | null;
  fileUrl: string | null;
  fileSize: number | null;
  fileType: string | null;
  mimeType: string | null;

  // Document Type
  documentType: string; // 'contract' | 'disclosure' | 'addendum' | 'inspection' | 'appraisal' | 'title' | 'insurance' | etc.
  documentCategory: string | null; // 'buyer' | 'seller' | 'lender' | 'title' | etc.

  // Template Reference
  templateId: string | null; // Which template this was created from
  templateName: string | null;

  // Folder Reference
  transactionFolderId: string;

  // Status
  status: string; // 'pending' | 'draft' | 'sent' | 'viewed' | 'signed' | 'completed' | 'declined' | 'expired'
  documentStatus: string; // 'not_started' | 'in_progress' | 'complete'

  // E-Signature Tracking
  requiresSignature: boolean;
  signatureStatus: string | null; // 'pending' | 'partial' | 'complete'
  signatureProvider: string | null; // 'docusign' | 'dotloop' | 'internal' | etc.
  signatureRequestId: string | null; // External signature request ID
  signatureRequestUrl: string | null;

  // Signers (JSON array of signer info)
  signers: string | null; // [{name, email, role, status, signedAt}]
  signerCount: number;
  signedCount: number;

  // Key Dates
  sentAt: Date | null;
  viewedAt: Date | null;
  signedAt: Date | null;
  completedAt: Date | null;
  expiresAt: Date | null;

  // Reminders
  reminderEnabled: boolean;
  reminderSentAt: Date | null;
  reminderCount: number;

  // Version Control
  version: number;
  isLatestVersion: boolean;
  previousVersionId: string | null;

  // Google Drive Sync
  driveFileId: string | null;
  driveFileUrl: string | null;
  driveSyncedAt: Date | null;

  // Ordering
  position: number;
  section: string | null; // Group by section

  // Metadata
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  owner: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  ownerId: string | null;

  uploadedBy: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  uploadedById: string | null;

  // Primary signer (buyer/seller)
  primarySigner: EntityRelation<PersonWorkspaceEntity> | null;
  primarySignerId: string | null;

  searchVector: string;
}
