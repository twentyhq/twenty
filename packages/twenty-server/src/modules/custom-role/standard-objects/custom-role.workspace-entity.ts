import {
    type ActorMetadata,
    FieldMetadataType,
    type RichTextV2Metadata,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_CUSTOM_ROLE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

/**
 * CustomRole Entity
 * Defines custom roles beyond the standard ones
 * Each role has specific permissions and workspace access
 */
export class CustomRoleWorkspaceEntity extends BaseWorkspaceEntity {
  // Basic Info
  name: string;
  description: RichTextV2Metadata | null;

  // Role Configuration
  roleType: string; // 'agent' | 'tc' | 'admin' | 'mortgage' | 'marketing' | 'finance' | 'leadership' | 'custom'
  workspaceType: string; // Which workspace this role accesses

  // Status
  isActive: boolean;
  isDefault: boolean; // Default role for new users
  isSystemRole: boolean; // Cannot be deleted

  // Permissions (JSON)
  permissions: string; // JSON object with all permissions

  // Navigation
  allowedMenuItems: string | null; // JSON array of allowed menu items
  defaultDashboard: string | null; // Default dashboard for this role

  // Data Access
  dataScope: string; // 'own' | 'team' | 'all'
  canViewOthersData: boolean;
  canEditOthersData: boolean;
  canDeleteOthersData: boolean;

  // Feature Access
  canAccessSettings: boolean;
  canManageUsers: boolean;
  canManageAutomations: boolean;
  canAccessReports: boolean;
  canSendEmails: boolean;
  canSendSms: boolean;
  canExportData: boolean;

  // AI Access
  canUseAI: boolean;
  aiPermissions: string | null; // JSON of specific AI permissions

  // Metadata
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  favorites: EntityRelation<FavoriteWorkspaceEntity[]>;

  searchVector: string;
}
