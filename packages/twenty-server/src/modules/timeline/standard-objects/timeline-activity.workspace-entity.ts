import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { type DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';
import { type NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';
import { type OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { type TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_TIMELINE_ACTIVITY: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class TimelineActivityWorkspaceEntity extends BaseWorkspaceEntity {
  happensAt: Date;
  name: string | null;
  properties: JSON | null;
  linkedRecordCachedName: string | null;
  linkedRecordId: string | null;
  linkedObjectMetadataId: string | null;
  workspaceMember: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  workspaceMemberId: string | null;
  targetPerson: EntityRelation<PersonWorkspaceEntity> | null;
  targetPersonId: string | null;
  targetCompany: EntityRelation<CompanyWorkspaceEntity> | null;
  targetCompanyId: string | null;
  targetOpportunity: EntityRelation<OpportunityWorkspaceEntity> | null;
  targetOpportunityId: string | null;
  targetNote: EntityRelation<NoteWorkspaceEntity> | null;
  targetNoteId: string | null;
  targetTask: EntityRelation<TaskWorkspaceEntity> | null;
  targetTaskId: string | null;
  targetWorkflow: EntityRelation<WorkflowWorkspaceEntity> | null;
  targetWorkflowId: string | null;
  targetWorkflowVersion: EntityRelation<WorkflowVersionWorkspaceEntity> | null;
  targetWorkflowVersionId: string | null;
  targetWorkflowRun: EntityRelation<WorkflowRunWorkspaceEntity> | null;
  targetWorkflowRunId: string | null;
  targetDashboard: EntityRelation<DashboardWorkspaceEntity> | null;
  targetDashboardId: string | null;
  custom: EntityRelation<CustomWorkspaceEntity>;
  targetCustom: EntityRelation<CustomWorkspaceEntity>;
}
