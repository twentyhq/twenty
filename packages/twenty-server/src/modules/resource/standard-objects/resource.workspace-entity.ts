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

export const SEARCH_FIELDS_FOR_RESOURCE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

/**
 * Resource Entity
 * Shareable files and resources that can be attached to tasks, transactions, etc.
 * Admins can upload company resources, users can upload their own
 */
export class ResourceWorkspaceEntity extends BaseWorkspaceEntity {
  // Basic Info
  name: string;
  description: string | null;

  // File Info
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  fileType: string | null; // 'pdf' | 'docx' | 'xlsx' | 'image' | 'video' | etc.
  mimeType: string | null;
  thumbnailUrl: string | null;

  // Resource Type & Category
  resourceType: string; // 'template' | 'document' | 'image' | 'video' | 'guide' | 'form' | 'other'
  category: string | null; // 'marketing' | 'legal' | 'training' | 'forms' | 'contracts' | etc.
  subcategory: string | null;

  // Template Settings (if it's a template)
  isTemplate: boolean;
  templateType: string | null; // 'buyer' | 'seller' | 'mortgage' | 'lease' | etc.
  templateCategory: string | null; // 'contract' | 'disclosure' | 'addendum' | etc.

  // Sharing & Visibility
  visibility: string; // 'private' | 'team' | 'company' | 'public'
  isShared: boolean;
  shareLink: string | null; // Public share link
  shareExpiration: Date | null;

  // Access Control
  isAdminOnly: boolean; // Only admins can edit/delete
  allowDownload: boolean;
  allowCopy: boolean;

  // Usage Tracking
  viewCount: number;
  downloadCount: number;
  lastViewedAt: Date | null;
  lastDownloadedAt: Date | null;

  // Organization
  folderId: string | null;
  folderPath: string | null;
  tags: string | null; // JSON array of tags

  // Status
  status: string; // 'active' | 'archived' | 'draft'
  isActive: boolean;

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
