import { ActorMetadata } from 'twenty-shared/types';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';
import { NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';
import { OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export class AttachmentWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  fullPath: string | null;
  type: string | null;
  fileCategory: string;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
  author: Relation<WorkspaceMemberWorkspaceEntity> | null;
  authorId: string | null;
  task: Relation<TaskWorkspaceEntity> | null;
  taskId: string | null;
  note: Relation<NoteWorkspaceEntity> | null;
  noteId: string | null;
  person: Relation<PersonWorkspaceEntity> | null;
  personId: string | null;
  company: Relation<CompanyWorkspaceEntity> | null;
  companyId: string | null;
  opportunity: Relation<OpportunityWorkspaceEntity> | null;
  opportunityId: string | null;
  dashboard: Relation<DashboardWorkspaceEntity> | null;
  dashboardId: string | null;
  workflow: Relation<WorkflowWorkspaceEntity> | null;
  workflowId: string | null;
  custom: Relation<CustomWorkspaceEntity>;
}
