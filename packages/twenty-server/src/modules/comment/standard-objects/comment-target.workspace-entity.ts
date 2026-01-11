import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type CommentWorkspaceEntity } from 'src/modules/comment/standard-objects/comment.workspace-entity';
import { type CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { type OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { type TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';

export class CommentTargetWorkspaceEntity extends BaseWorkspaceEntity {
  comment: EntityRelation<CommentWorkspaceEntity> | null;
  commentId: string | null;
  person: EntityRelation<PersonWorkspaceEntity> | null;
  personId: string | null;
  company: EntityRelation<CompanyWorkspaceEntity> | null;
  companyId: string | null;
  opportunity: EntityRelation<OpportunityWorkspaceEntity> | null;
  opportunityId: string | null;
  task: EntityRelation<TaskWorkspaceEntity> | null;
  taskId: string | null;
  custom: EntityRelation<CustomWorkspaceEntity>;
}
