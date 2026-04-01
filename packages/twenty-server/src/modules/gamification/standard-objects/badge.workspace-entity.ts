import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_BADGE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class BadgeWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  description: string | null;
  icon: string | null;
  type: string;
  criteria: string | null;
  points: number;
  isActive: boolean;
  searchVector: string;
}

export class BadgeAwardWorkspaceEntity extends BaseWorkspaceEntity {
  awardedAt: Date;
  note: string | null;
  badge: EntityRelation<BadgeWorkspaceEntity> | null;
  badgeId: string | null;
  recipient: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  recipientId: string | null;
}
