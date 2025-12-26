import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationOnDeleteAction } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { WorkspaceDynamicRelation } from 'src/engine/twenty-orm/decorators/workspace-dynamic-relation.decorator';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { TIMELINE_ACTIVITY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
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
  labelIdentifierStandardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.name,
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
  @WorkspaceIsFieldUIReadOnly()
  happensAt: Date;

  @WorkspaceField({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Event name`,
    description: msg`Event name`,
    icon: 'IconAbc',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  name: string | null;

  @WorkspaceField({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.properties,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Event details`,
    description: msg`Json value for event details`,
    icon: 'IconListDetails',
  })
  @WorkspaceIsFieldUIReadOnly()
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
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  linkedRecordCachedName: string | null;

  @WorkspaceField({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.linkedRecordId,
    type: FieldMetadataType.UUID,
    label: msg`Linked Record id`,
    description: msg`Linked Record id`,
    icon: 'IconAbc',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  linkedRecordId: string | null;

  @WorkspaceField({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.linkedObjectMetadataId,
    type: FieldMetadataType.UUID,
    label: msg`Linked Object Metadata Id`,
    description: msg`Linked Object Metadata Id`,
    icon: 'IconAbc',
  })
  @WorkspaceIsFieldUIReadOnly()
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
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  workspaceMember: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('workspaceMember')
  workspaceMemberId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetPerson,
    type: RelationType.MANY_TO_ONE,
    label: msg`Person`,
    description: msg`Event person`,
    icon: 'IconUser',
    inverseSideTarget: () => PersonWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
    isMorphRelation: true,
    morphId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetMorphId,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  targetPerson: Relation<PersonWorkspaceEntity> | null;

  @WorkspaceJoinColumn('targetPerson')
  targetPersonId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetCompany,
    type: RelationType.MANY_TO_ONE,
    label: msg`Company`,
    description: msg`Event company`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
    isMorphRelation: true,
    morphId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetMorphId,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  targetCompany: Relation<CompanyWorkspaceEntity> | null;

  @WorkspaceJoinColumn('targetCompany')
  targetCompanyId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetOpportunity,
    type: RelationType.MANY_TO_ONE,
    label: msg`Opportunity`,
    description: msg`Event opportunity`,
    icon: 'IconTargetArrow',
    inverseSideTarget: () => OpportunityWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.SET_NULL,
    isMorphRelation: true,
    morphId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetMorphId,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  targetOpportunity: Relation<OpportunityWorkspaceEntity> | null;

  @WorkspaceJoinColumn('targetOpportunity')
  targetOpportunityId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetNote,
    type: RelationType.MANY_TO_ONE,
    label: msg`Note`,
    description: msg`Event note`,
    icon: 'IconTargetArrow',
    inverseSideTarget: () => NoteWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.SET_NULL,
    isMorphRelation: true,
    morphId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetMorphId,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  targetNote: Relation<NoteWorkspaceEntity> | null;

  @WorkspaceJoinColumn('targetNote')
  targetNoteId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetTask,
    type: RelationType.MANY_TO_ONE,
    label: msg`Task`,
    description: msg`Event task`,
    icon: 'IconTargetArrow',
    inverseSideTarget: () => TaskWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.SET_NULL,
    isMorphRelation: true,
    morphId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetMorphId,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  targetTask: Relation<TaskWorkspaceEntity> | null;

  @WorkspaceJoinColumn('targetTask')
  targetTaskId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetWorkflow,
    type: RelationType.MANY_TO_ONE,
    label: msg`Workflow`,
    description: msg`Event workflow`,
    icon: 'IconTargetArrow',
    inverseSideTarget: () => WorkflowWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
    isMorphRelation: true,
    morphId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetMorphId,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  targetWorkflow: Relation<WorkflowWorkspaceEntity> | null;

  @WorkspaceJoinColumn('targetWorkflow')
  targetWorkflowId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetWorkflowVersion,
    type: RelationType.MANY_TO_ONE,
    label: msg`WorkflowVersion`,
    description: msg`Event workflow version`,
    icon: 'IconTargetArrow',
    inverseSideTarget: () => WorkflowVersionWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
    isMorphRelation: true,
    morphId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetMorphId,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  targetWorkflowVersion: Relation<WorkflowVersionWorkspaceEntity> | null;

  @WorkspaceJoinColumn('targetWorkflowVersion')
  targetWorkflowVersionId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetWorkflowRun,
    type: RelationType.MANY_TO_ONE,
    label: msg`Workflow Run`,
    description: msg`Event workflow run`,
    icon: 'IconTargetArrow',
    inverseSideTarget: () => WorkflowRunWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
    isMorphRelation: true,
    morphId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetMorphId,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  targetWorkflowRun: Relation<WorkflowRunWorkspaceEntity> | null;

  @WorkspaceJoinColumn('targetWorkflowRun')
  targetWorkflowRunId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetDashboard,
    type: RelationType.MANY_TO_ONE,
    label: msg`Dashboard`,
    description: msg`Event dashboard`,
    icon: 'IconTargetArrow',
    inverseSideTarget: () => DashboardWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.SET_NULL,
    isMorphRelation: true,
    morphId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetMorphId,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  targetDashboard: Relation<DashboardWorkspaceEntity> | null;

  @WorkspaceJoinColumn('targetDashboard')
  targetDashboardId: string | null;

  // todo: remove this decorator and the custom field
  @WorkspaceDynamicRelation({
    type: RelationType.MANY_TO_ONE,
    argsFactory: (oppositeObjectMetadata) => ({
      standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetCustom,
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

  @WorkspaceDynamicRelation({
    type: RelationType.MANY_TO_ONE,
    argsFactory: (oppositeObjectMetadata) => ({
      standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetCustom,
      name: oppositeObjectMetadata.nameSingular,
      label: oppositeObjectMetadata.labelSingular,
      description: `Timeline Activity ${oppositeObjectMetadata.labelSingular}`,
      joinColumn: `target${capitalize(oppositeObjectMetadata.nameSingular)}Id`,
      icon: 'IconTimeline',
    }),
    inverseSideTarget: () => CustomWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  targetCustom: Relation<CustomWorkspaceEntity>;
}
