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

export const SEARCH_FIELDS_FOR_COLLABORATOR: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

/**
 * Collaborator Entity
 * People invited to collaborate on a transaction (external or internal)
 */
export class CollaboratorWorkspaceEntity extends BaseWorkspaceEntity {
  // Basic Info
  name: string;
  email: string;
  phone: string | null;

  // Related Entity
  relatedEntityType: string; // 'transaction' | 'transaction_folder' | 'document' | etc.
  relatedEntityId: string;

  // Role & Permissions
  role: string; // 'buyer' | 'seller' | 'agent' | 'lender' | 'title' | 'attorney' | 'inspector' | 'viewer' | 'editor'
  customRoleLabel: string | null;

  // Permissions (specific)
  canView: boolean;
  canEdit: boolean;
  canUpload: boolean;
  canDownload: boolean;
  canSign: boolean;
  canComment: boolean;
  canInviteOthers: boolean;

  // Access
  accessType: string; // 'full' | 'limited' | 'view_only' | 'sign_only'

  // Invitation Status
  inviteStatus: string; // 'pending' | 'sent' | 'accepted' | 'declined' | 'expired'
  inviteSentAt: Date | null;
  inviteAcceptedAt: Date | null;
  inviteExpiresAt: Date | null;
  inviteLink: string | null;

  // Activity Tracking
  lastAccessAt: Date | null;
  accessCount: number;

  // External or Internal
  isExternal: boolean; // Not a workspace member
  isActive: boolean;

  // Metadata
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;

  // Relations (internal member if applicable)
  workspaceMember: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  workspaceMemberId: string | null;

  // External person contact
  person: EntityRelation<PersonWorkspaceEntity> | null;
  personId: string | null;

  // Who invited this collaborator
  invitedBy: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  invitedById: string | null;

  searchVector: string;
}
