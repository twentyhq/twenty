import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';
import { NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';
import { OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';
import { WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export class TimelineActivityWorkspaceEntity extends BaseWorkspaceEntity {
  happensAt: Date;
  name: string | null;
  properties: JSON | null;
  linkedRecordCachedName: string | null;
  linkedRecordId: string | null;
  linkedObjectMetadataId: string | null;
  workspaceMember: Relation<WorkspaceMemberWorkspaceEntity> | null;
  workspaceMemberId: string | null;
  targetPerson: Relation<PersonWorkspaceEntity> | null;
  targetPersonId: string | null;
  targetCompany: Relation<CompanyWorkspaceEntity> | null;
  targetCompanyId: string | null;
  targetOpportunity: Relation<OpportunityWorkspaceEntity> | null;
  targetOpportunityId: string | null;
  targetNote: Relation<NoteWorkspaceEntity> | null;
  targetNoteId: string | null;
  targetTask: Relation<TaskWorkspaceEntity> | null;
  targetTaskId: string | null;
  targetWorkflow: Relation<WorkflowWorkspaceEntity> | null;
  targetWorkflowId: string | null;
  targetWorkflowVersion: Relation<WorkflowVersionWorkspaceEntity> | null;
  targetWorkflowVersionId: string | null;
  targetWorkflowRun: Relation<WorkflowRunWorkspaceEntity> | null;
  targetWorkflowRunId: string | null;
  targetDashboard: Relation<DashboardWorkspaceEntity> | null;
  targetDashboardId: string | null;
  custom: Relation<CustomWorkspaceEntity>;
  targetCustom: Relation<CustomWorkspaceEntity>;
}
