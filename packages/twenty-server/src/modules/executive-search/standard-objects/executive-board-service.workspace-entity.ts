import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type ExecutiveProfileWorkspaceEntity } from 'src/modules/executive-search/standard-objects/executive-profile.workspace-entity';
import { type BoardType } from 'src/modules/executive-search/common/enums/board-type.enum';

export class ExecutiveBoardServiceWorkspaceEntity extends BaseWorkspaceEntity {
  executiveProfile: EntityRelation<ExecutiveProfileWorkspaceEntity> | null;
  executiveProfileId: string | null;
  companyName: string | null;
  ticker: string | null;
  role: string | null;
  boardType: BoardType;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  isIndependent: boolean;
  committees: string | null;
}
