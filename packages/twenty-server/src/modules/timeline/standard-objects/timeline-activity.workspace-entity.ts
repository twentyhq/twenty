import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { WorkspaceDynamicRelation } from 'src/engine/twenty-orm/decorators/workspace-dynamic-relation.decorator';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceGate } from 'src/engine/twenty-orm/decorators/workspace-gate.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { TIMELINE_ACTIVITY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
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

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.timelineActivity,
  namePlural: 'timelineActivities',
  labelSingular: msg`Timeline Activity`,
  labelPlural: msg`Timeline Activities`,
  description: msg`Aggregated / filtered event to be displayed on the timeline`,
  icon: STANDARD_OBJECT_ICONS.timelineActivity,
})
@WorkspaceIsSystem()
@WorkspaceIsNotAuditLogged()
export class TimelineActivityWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.happensAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Creation date`,
    description: msg`Creation date`,
    icon: 'IconCalendar',
    defaultValue: 'now',
  })
  happensAt: Date;

  @WorkspaceField({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Event name`,
    description: msg`Event name`,
    icon: 'IconAbc',
  })
  name: string;

  @WorkspaceField({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.properties,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Event details`,
    description: msg`Json value for event details`,
    icon: 'IconListDetails',
  })
  @WorkspaceIsNullable()
  properties: JSON | null;

  // Special objects that don't have their own timeline and are 'link' to the main object
  @WorkspaceField({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.linkedRecordCachedName,
    type: FieldMetadataType.TEXT,
    label: msg`Linked Record cached name`,
    description: msg`Cached record name`,
    icon: 'IconAbc',
  })
  linkedRecordCachedName: string;

  @WorkspaceField({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.linkedRecordId,
    type: FieldMetadataType.UUID,
    label: msg`Linked Record id`,
    description: msg`Linked Record id`,
    icon: 'IconAbc',
  })
  @WorkspaceIsNullable()
  linkedRecordId: string | null;

  @WorkspaceField({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.linkedObjectMetadataId,
    type: FieldMetadataType.UUID,
    label: msg`Linked Object Metadata Id`,
    description: msg`Linked Object Metadata Id`,
    icon: 'IconAbc',
  })
  @WorkspaceIsNullable()
  linkedObjectMetadataId: string | null;

  // Who made the action
  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.workspaceMember,
    type: RelationType.MANY_TO_ONE,
    label: msg`Workspace Member`,
    description: msg`Event workspace member`,
    icon: 'IconCircleUser',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  workspaceMember: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('workspaceMember')
  workspaceMemberId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.person,
    type: RelationType.MANY_TO_ONE,
    label: msg`Person`,
    description: msg`Event person`,
    icon: 'IconUser',
    inverseSideTarget: () => PersonWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  person: Relation<PersonWorkspaceEntity> | null;

  @WorkspaceJoinColumn('person')
  personId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.company,
    type: RelationType.MANY_TO_ONE,
    label: msg`Company`,
    description: msg`Event company`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  company: Relation<CompanyWorkspaceEntity> | null;

  @WorkspaceJoinColumn('company')
  companyId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.opportunity,
    type: RelationType.MANY_TO_ONE,
    label: msg`Opportunity`,
    description: msg`Event opportunity`,
    icon: 'IconTargetArrow',
    inverseSideTarget: () => OpportunityWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  opportunity: Relation<OpportunityWorkspaceEntity> | null;

  @WorkspaceJoinColumn('opportunity')
  opportunityId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.note,
    type: RelationType.MANY_TO_ONE,
    label: msg`Note`,
    description: msg`Event note`,
    icon: 'IconTargetArrow',
    inverseSideTarget: () => NoteWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  note: Relation<NoteWorkspaceEntity> | null;

  @WorkspaceJoinColumn('note')
  noteId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.task,
    type: RelationType.MANY_TO_ONE,
    label: msg`Task`,
    description: msg`Event task`,
    icon: 'IconTargetArrow',
    inverseSideTarget: () => TaskWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  task: Relation<TaskWorkspaceEntity> | null;

  @WorkspaceJoinColumn('task')
  taskId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.workflow,
    type: RelationType.MANY_TO_ONE,
    label: msg`Workflow`,
    description: msg`Event workflow`,
    icon: 'IconTargetArrow',
    inverseSideTarget: () => WorkflowWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  workflow: Relation<WorkflowWorkspaceEntity> | null;

  @WorkspaceJoinColumn('workflow')
  workflowId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.workflowVersion,
    type: RelationType.MANY_TO_ONE,
    label: msg`WorkflowVersion`,
    description: msg`Event workflow version`,
    icon: 'IconTargetArrow',
    inverseSideTarget: () => WorkflowVersionWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  workflowVersion: Relation<WorkflowVersionWorkspaceEntity> | null;

  @WorkspaceJoinColumn('workflowVersion')
  workflowVersionId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.workflowRun,
    type: RelationType.MANY_TO_ONE,
    label: msg`Workflow Run`,
    description: msg`Event workflow run`,
    icon: 'IconTargetArrow',
    inverseSideTarget: () => WorkflowRunWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  workflowRun: Relation<WorkflowRunWorkspaceEntity> | null;

  @WorkspaceJoinColumn('workflowRun')
  workflowRunId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.dashboard,
    type: RelationType.MANY_TO_ONE,
    label: msg`Dashboard`,
    description: msg`Event dashboard`,
    icon: 'IconTargetArrow',
    inverseSideTarget: () => DashboardWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceGate({
    featureFlag: FeatureFlagKey.IS_PAGE_LAYOUT_ENABLED,
  })
  @WorkspaceIsNullable()
  dashboard: Relation<DashboardWorkspaceEntity> | null;

  @WorkspaceJoinColumn('dashboard')
  @WorkspaceGate({
    featureFlag: FeatureFlagKey.IS_PAGE_LAYOUT_ENABLED,
  })
  dashboardId: string | null;

  @WorkspaceDynamicRelation({
    type: RelationType.MANY_TO_ONE,
    argsFactory: (oppositeObjectMetadata) => ({
      standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.custom,
      name: oppositeObjectMetadata.nameSingular,
      label: oppositeObjectMetadata.labelSingular,
      description: `Timeline Activity ${oppositeObjectMetadata.labelSingular}`,
      joinColumn: `${oppositeObjectMetadata.nameSingular}Id`,
      icon: 'IconTimeline',
    }),
    inverseSideTarget: () => CustomWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  custom: Relation<CustomWorkspaceEntity>;
}
