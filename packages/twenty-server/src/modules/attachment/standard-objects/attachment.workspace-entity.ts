import { type ActorMetadata } from 'twenty-shared/types';

import { type FileOutput } from 'src/engine/api/common/common-args-processors/data-arg-processor/types/file-item.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { type DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';
import { type NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';
import { type OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { type TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export class AttachmentWorkspaceEntity extends BaseWorkspaceEntity {
  /** @deprecated Use `file[0].label` field instead */
  name: string | null;
  file: FileOutput[] | null;
  /** @deprecated Use `file[0].fileId` field instead */
  fullPath: string | null;
  /** @deprecated Use `fileCategory` field instead */
  type: string | null;
  /** @deprecated Use `file[0].extension` field instead */
  fileCategory: string;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
  /** @deprecated */
  author: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  authorId: string | null;
  targetTask: EntityRelation<TaskWorkspaceEntity> | null;
  targetTaskId: string | null;
  targetNote: EntityRelation<NoteWorkspaceEntity> | null;
  targetNoteId: string | null;
  targetPerson: EntityRelation<PersonWorkspaceEntity> | null;
  targetPersonId: string | null;
  targetCompany: EntityRelation<CompanyWorkspaceEntity> | null;
  targetCompanyId: string | null;
  targetOpportunity: EntityRelation<OpportunityWorkspaceEntity> | null;
  targetOpportunityId: string | null;
  targetDashboard: EntityRelation<DashboardWorkspaceEntity> | null;
  targetDashboardId: string | null;
  targetWorkflow: EntityRelation<WorkflowWorkspaceEntity> | null;
  targetWorkflowId: string | null;
  custom: EntityRelation<CustomWorkspaceEntity>;
}
