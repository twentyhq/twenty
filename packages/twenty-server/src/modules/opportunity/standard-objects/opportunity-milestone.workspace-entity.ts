import {
  type ActorMetadata,
  FieldMetadataType,
  type RichTextMetadata,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { type OpportunityMilestoneDependencyWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity-milestone-dependency.workspace-entity';
import { type OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { type TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';
const DESCRIPTION_FIELD_NAME = 'description';

export const SEARCH_FIELDS_FOR_OPPORTUNITY_MILESTONE: FieldTypeAndNameMetadata[] =
  [
    { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
    { name: DESCRIPTION_FIELD_NAME, type: FieldMetadataType.RICH_TEXT },
  ];

export class OpportunityMilestoneWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  description: RichTextMetadata | null;
  plannedStartDate: Date | null;
  plannedEndDate: Date | null;
  actualStartDate: Date | null;
  actualEndDate: Date | null;
  status: string;
  blockedBy: string;
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
  opportunity: EntityRelation<OpportunityWorkspaceEntity> | null;
  opportunityId: string | null;
  assignee: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  assigneeId: string | null;
  attachments: EntityRelation<AttachmentWorkspaceEntity[]>;
  timelineActivities: EntityRelation<TimelineActivityWorkspaceEntity[]>;
  // Edges where this milestone is the *dependent* (i.e. its predecessors).
  dependsOnEdges: EntityRelation<OpportunityMilestoneDependencyWorkspaceEntity[]>;
  // Edges where this milestone is the *required* one (i.e. milestones that wait on it).
  requiredByEdges: EntityRelation<OpportunityMilestoneDependencyWorkspaceEntity[]>;
  searchVector: string;
}
