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

export const SEARCH_FIELDS_FOR_TRANSACTION_FOLDER: FieldTypeAndNameMetadata[] =
  [{ name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT }];

/**
 * TransactionFolder Entity
 * Organized folder structure for transactions with tabs:
 * - Overview, Files, Timeline, Checklist, Compliance, Finance
 */
export class TransactionFolderWorkspaceEntity extends BaseWorkspaceEntity {
  // Basic Info
  name: string;
  description: string | null;

  // Folder Type
  folderType: string; // 'buyer' | 'seller' | 'dual' | 'lease' | 'mortgage' | 'property_mgmt' | 'custom'
  businessType: string; // 'real_estate' | 'mortgage' | 'property_management' | 'insurance' | etc.

  // Related Transaction
  transactionId: string | null;

  // Sharing
  shareLink: string | null; // Public share link for collaborators
  shareEnabled: boolean;
  shareExpiration: Date | null;
  sharePassword: string | null; // Optional password protection

  // Google Drive Integration
  driveEnabled: boolean;
  driveFolderId: string | null; // Google Drive folder ID
  driveFolderUrl: string | null;
  driveLastSyncAt: Date | null;
  driveAutoSync: boolean;

  // Folder Stats
  fileCount: number;
  totalSize: number; // in bytes
  completedDocuments: number;
  pendingDocuments: number;
  pendingSignatures: number;

  // Status
  status: string; // 'active' | 'completed' | 'archived'
  completedAt: Date | null;

  // Access Control
  isPublic: boolean;

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
