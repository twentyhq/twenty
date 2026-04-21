import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_USER_POINTS: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class UserPointsWorkspaceEntity extends BaseWorkspaceEntity {
  user: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  userId: string | null;
  totalPoints: number;
  currentLevel: number;
  levelName: string;
  badgesEarned: number;
  dealsWon: number;
  revenueGenerated: number;
  streakDays: number;
  lastActivityDate: Date | null;
  searchVector: string;
}
