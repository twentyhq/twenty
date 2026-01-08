import { type ActorMetadata } from 'twenty-shared/types';

import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration-v2/types/entity-relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { type CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { type DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';
import { type NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';
import { type OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { type TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export class AttachmentWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  fullPath: string | null;
  type: string | null;
  fileCategory: string;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
  author: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  authorId: string | null;
  task: EntityRelation<TaskWorkspaceEntity> | null;
  taskId: string | null;
  note: EntityRelation<NoteWorkspaceEntity> | null;
  noteId: string | null;
  person: EntityRelation<PersonWorkspaceEntity> | null;
  personId: string | null;
  company: EntityRelation<CompanyWorkspaceEntity> | null;
  companyId: string | null;
  opportunity: EntityRelation<OpportunityWorkspaceEntity> | null;
  opportunityId: string | null;
  dashboard: EntityRelation<DashboardWorkspaceEntity> | null;
  dashboardId: string | null;
  workflow: EntityRelation<WorkflowWorkspaceEntity> | null;
  workflowId: string | null;
  custom: EntityRelation<CustomWorkspaceEntity>;
}
