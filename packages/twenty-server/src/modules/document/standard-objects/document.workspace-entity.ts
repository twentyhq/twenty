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

export const SEARCH_FIELDS_FOR_DOCUMENT: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

/**
 * Document Entity
 * Tracks documents with version history, signatures, and compliance
 */
export class DocumentWorkspaceEntity extends BaseWorkspaceEntity {
  // Basic Info
  name: string;
  description: string | null;

  // File Info
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  fileType: string | null; // 'pdf' | 'docx' | 'xlsx' | 'image' | etc.
  mimeType: string | null;

  // Document Type
  documentType: string; // 'contract' | 'disclosure' | 'addendum' | 'inspection' | 'appraisal' | 'title' | 'insurance' | 'other'
  category: string | null;

  // Status
  status: string; // 'draft' | 'pending_review' | 'pending_signature' | 'signed' | 'approved' | 'rejected' | 'expired'

  // Version Control
  version: number;
  isLatestVersion: boolean;
  previousVersionId: string | null;

  // Signature Tracking
  requiresSignature: boolean;
  signatureStatus: string | null; // 'pending' | 'partial' | 'complete'
  signedAt: Date | null;
  signedBy: string | null; // JSON array of signers
  signatureCount: number;
  requiredSignatureCount: number;

  // Expiration
  expiresAt: Date | null;
  isExpired: boolean;

  // Related Entity
  relatedEntityType: string | null; // 'transaction' | 'mortgage' | 'compliance' | etc.
  relatedEntityId: string | null;

  // Folder/Organization
  folderId: string | null;
  folderPath: string | null;

  // Access Control
  isPublic: boolean;
  sharedWith: string | null; // JSON array of user IDs

  // Metadata
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  owner: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  ownerId: string | null;

  uploadedBy: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  uploadedById: string | null;

  favorites: EntityRelation<FavoriteWorkspaceEntity[]>;

  searchVector: string;
}
