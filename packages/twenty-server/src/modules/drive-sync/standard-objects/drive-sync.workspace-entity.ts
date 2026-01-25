import {
  type ActorMetadata,
  FieldMetadataType,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_DRIVE_SYNC: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

/**
 * DriveSync Entity
 * Tracks Google Drive synchronization for transaction folders
 */
export class DriveSyncWorkspaceEntity extends BaseWorkspaceEntity {
  // Basic Info
  name: string;

  // Connection Settings
  provider: string; // 'google_drive' | 'dropbox' | 'onedrive'
  isConnected: boolean;
  connectionStatus: string; // 'connected' | 'disconnected' | 'error' | 'pending'

  // OAuth Info
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
  accountEmail: string | null;
  accountName: string | null;

  // Root Folder
  rootFolderId: string | null; // Root folder in Drive
  rootFolderName: string | null;
  rootFolderUrl: string | null;

  // Sync Settings
  autoSyncEnabled: boolean;
  syncFrequency: string; // 'realtime' | 'hourly' | 'daily' | 'manual'
  syncDirection: string; // 'upload_only' | 'download_only' | 'both'

  // Folder Structure Template
  folderStructureTemplate: string | null; // JSON template for auto-creating folders

  // Sync Status
  lastSyncAt: Date | null;
  lastSyncStatus: string | null; // 'success' | 'partial' | 'failed'
  lastSyncError: string | null;
  syncInProgress: boolean;

  // Stats
  totalFilesUploaded: number;
  totalFilesDownloaded: number;
  totalStorageUsed: number; // bytes
  failedSyncCount: number;

  // Notifications
  notifyOnSync: boolean;
  notifyOnError: boolean;

  // Metadata
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  owner: EntityRelation<WorkspaceMemberWorkspaceEntity>;
  ownerId: string;

  searchVector: string;
}

/**
 * Default folder structure for Google Drive sync
 */
export const DEFAULT_DRIVE_FOLDER_STRUCTURE = {
  real_estate: {
    buyer: [
      'Contracts',
      'Disclosures',
      'Inspections',
      'Appraisal',
      'Title',
      'Insurance',
      'Closing Documents',
      'Correspondence',
    ],
    seller: [
      'Listing Agreement',
      'Disclosures',
      'Marketing',
      'Offers',
      'Contracts',
      'Inspections',
      'Title',
      'Closing Documents',
      'Correspondence',
    ],
  },
  mortgage: {
    loan: [
      'Application',
      'Income Documents',
      'Asset Documents',
      'Credit',
      'Appraisal',
      'Title',
      'Insurance',
      'Conditions',
      'Closing Documents',
    ],
  },
  property_management: {
    property: [
      'Lease Agreements',
      'Tenant Documents',
      'Maintenance',
      'Inspections',
      'Financial',
      'Insurance',
      'Correspondence',
    ],
  },
};
