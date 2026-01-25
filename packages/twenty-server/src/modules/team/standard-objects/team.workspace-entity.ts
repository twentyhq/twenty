import {
    type ActorMetadata,
    FieldMetadataType,
    type RichTextV2Metadata,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_TEAM: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

/**
 * Team Entity
 * Represents a team within the organization (Agent teams, departments, etc.)
 * Teams scope data and provide role-based access
 */
export class TeamWorkspaceEntity extends BaseWorkspaceEntity {
  // Basic Info
  name: string;
  description: RichTextV2Metadata | null;

  // Team Settings
  teamType: string; // 'agent_team' | 'department' | 'brokerage' | 'custom'
  isActive: boolean;

  // Branding
  logoUrl: string | null;
  primaryColor: string | null;

  // Contact Info
  email: string | null;
  phone: string | null;

  // Stats
  memberCount: number;
  activeDealsCount: number;
  closedDealsCount: number;

  // Metadata
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations
  owner: EntityRelation<WorkspaceMemberWorkspaceEntity>;
  ownerId: string;

  members: EntityRelation<WorkspaceMemberWorkspaceEntity[]>;

  favorites: EntityRelation<FavoriteWorkspaceEntity[]>;

  searchVector: string;
}
