import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';
import { FavoriteFolderWorkspaceEntity } from 'src/modules/favorite-folder/standard-objects/favorite-folder.workspace-entity';
import { NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';
import { OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';
import { WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export class FavoriteWorkspaceEntity extends BaseWorkspaceEntity {
  position: number;
  forWorkspaceMember: Relation<WorkspaceMemberWorkspaceEntity>;
  forWorkspaceMemberId: string;
  person: Relation<PersonWorkspaceEntity> | null;
  personId: string;
  company: Relation<CompanyWorkspaceEntity> | null;
  companyId: string;
  favoriteFolder: Relation<FavoriteFolderWorkspaceEntity> | null;
  favoriteFolderId: string;
  opportunity: Relation<OpportunityWorkspaceEntity> | null;
  opportunityId: string;
  workflow: Relation<WorkflowWorkspaceEntity> | null;
  workflowId: string;
  workflowVersion: Relation<WorkflowVersionWorkspaceEntity> | null;
  workflowVersionId: string;
  workflowRun: Relation<WorkflowRunWorkspaceEntity> | null;
  workflowRunId: string;
  task: Relation<TaskWorkspaceEntity> | null;
  taskId: string;
  note: Relation<NoteWorkspaceEntity> | null;
  noteId: string;
  dashboard: Relation<DashboardWorkspaceEntity> | null;
  dashboardId: string;
  viewId: string;
  custom: Relation<CustomWorkspaceEntity>;
}
