import { msg } from '@lingui/core/macro';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  DateDisplayFormat,
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import {
  createStandardFieldFlatMetadata,
  type CreateStandardFieldArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-relation-field-flat-metadata.util';
export const buildTimelineActivityStandardFlatFieldMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  twentyStandardApplicationId,
}: Omit<
  CreateStandardFieldArgs<'timelineActivity', FieldMetadataType>,
  'context'
>): Record<
  AllStandardObjectFieldName<'timelineActivity'>,
  FlatFieldMetadata
> => ({
  id: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'id',
      type: FieldMetadataType.UUID,
      label: i18nLabel(msg({ message: `Id`, context: 'fieldMetadata.label' })),
      description: i18nLabel(
        msg({ message: `Id`, context: 'fieldMetadata.description' }),
      ),
      icon: 'Icon123',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: 'uuid',
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  createdAt: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'createdAt',
      type: FieldMetadataType.DATE_TIME,
      label: i18nLabel(
        msg({ message: `Creation date`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({ message: `Creation date`, context: 'fieldMetadata.description' }),
      ),
      icon: 'IconCalendar',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: 'now',
      settings: { displayFormat: DateDisplayFormat.RELATIVE },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  updatedAt: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'updatedAt',
      type: FieldMetadataType.DATE_TIME,
      label: i18nLabel(
        msg({ message: `Last update`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Last time the record was changed`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconCalendarClock',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: 'now',
      settings: { displayFormat: DateDisplayFormat.RELATIVE },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  deletedAt: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'deletedAt',
      type: FieldMetadataType.DATE_TIME,
      label: i18nLabel(
        msg({ message: `Deleted at`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Date when the record was deleted`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconCalendarMinus',
      isSystem: true,
      isNullable: true,
      isUIEditable: false,
      settings: { displayFormat: DateDisplayFormat.RELATIVE },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  createdBy: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'createdBy',
      type: FieldMetadataType.ACTOR,
      label: i18nLabel(
        msg({ message: `Created by`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `The creator of the record`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconCreativeCommonsSa',
      isSystem: true,
      isUIEditable: false,
      isNullable: false,
      defaultValue: {
        source: "'MANUAL'",
        name: "'System'",
        workspaceMemberId: null,
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  updatedBy: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'updatedBy',
      type: FieldMetadataType.ACTOR,
      label: i18nLabel(
        msg({ message: `Updated by`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `The workspace member who last updated the record`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconUserCircle',
      isSystem: true,
      isUIEditable: false,
      isNullable: false,
      defaultValue: {
        source: "'MANUAL'",
        name: "'System'",
        workspaceMemberId: null,
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  position: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'position',
      type: FieldMetadataType.POSITION,
      label: i18nLabel(
        msg({ message: `Position`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Timeline activity record position`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconHierarchy2',
      isSystem: true,
      isNullable: false,
      defaultValue: 0,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  happensAt: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'happensAt',
      type: FieldMetadataType.DATE_TIME,
      label: i18nLabel(
        msg({ message: `Creation date`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({ message: `Creation date`, context: 'fieldMetadata.description' }),
      ),
      icon: 'IconCalendar',
      isNullable: false,
      isUIEditable: false,
      defaultValue: 'now',
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  // Kept through 2.34 so new workspaces remain writable by 2.33 pods during a
  // rolling deployment. The 2.34 implementation ignores this field.
  name: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'name',
      type: FieldMetadataType.TEXT,
      label: i18nLabel(
        msg({ message: `Event name`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({ message: `Event name`, context: 'fieldMetadata.description' }),
      ),
      icon: 'IconAbc',
      isNullable: true,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  timelineActivityTypeId: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'timelineActivityTypeId',
      type: FieldMetadataType.UUID,
      label: i18nLabel(
        msg({ message: `Event type`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Timeline activity type describing this event`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconAbc',
      isSystem: true,
      isNullable: true,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  // A 2.33 pod cannot populate this field during the 2.34 rolling deployment.
  timelineActivityTypeSnapshot: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'timelineActivityTypeSnapshot',
      type: FieldMetadataType.RAW_JSON,
      label: i18nLabel(
        msg({ message: `Event type`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Timeline activity type describing this event`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconArchive',
      isSystem: true,
      isNullable: true,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  properties: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'properties',
      type: FieldMetadataType.RAW_JSON,
      label: i18nLabel(
        msg({ message: `Event details`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Json value for event details`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconListDetails',
      isNullable: true,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  linkedRecordCachedName: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'linkedRecordCachedName',
      type: FieldMetadataType.TEXT,
      label: i18nLabel(
        msg({
          message: `Linked Record cached name`,
          context: 'fieldMetadata.label',
        }),
      ),
      description: i18nLabel(
        msg({
          message: `Cached record name`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconAbc',
      isSystem: true,
      isNullable: true,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  linkedRecordId: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'linkedRecordId',
      type: FieldMetadataType.UUID,
      label: i18nLabel(
        msg({ message: `Linked Record id`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Linked Record id`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconAbc',
      isSystem: true,
      isNullable: true,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  linkedObjectMetadataId: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'linkedObjectMetadataId',
      type: FieldMetadataType.UUID,
      label: i18nLabel(
        msg({
          message: `Linked Object Metadata Id`,
          context: 'fieldMetadata.label',
        }),
      ),
      description: i18nLabel(
        msg({
          message: `Linked Object Metadata Id`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconAbc',
      isSystem: true,
      isNullable: true,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),

  workspaceMember: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.RELATION,
      morphId: null,
      fieldName: 'workspaceMember',
      label: i18nLabel(
        msg({ message: `Workspace Member`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Event workspace member`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconCircleUser',
      isNullable: true,
      isUIEditable: false,
      targetObjectName: 'workspaceMember',
      targetFieldName: 'timelineActivities',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.CASCADE,
        joinColumnName: 'workspaceMemberId',
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  targetPerson: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.MORPH_RELATION,
      morphId: STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId,
      fieldName: 'targetPerson',
      label: i18nLabel(
        msg({ message: `Person`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({ message: `Event target`, context: 'fieldMetadata.description' }),
      ),
      icon: 'IconTimelineEvent',
      isNullable: true,
      isUIEditable: false,
      isSystemSideEffect: true,
      targetObjectName: 'person',
      targetFieldName: 'timelineActivities',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.CASCADE,
        joinColumnName: 'targetPersonId',
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  targetCompany: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.MORPH_RELATION,
      morphId: STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId,
      fieldName: 'targetCompany',
      label: i18nLabel(
        msg({ message: `Company`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({ message: `Event target`, context: 'fieldMetadata.description' }),
      ),
      icon: 'IconTimelineEvent',
      isNullable: true,
      isUIEditable: false,
      isSystemSideEffect: true,
      targetObjectName: 'company',
      targetFieldName: 'timelineActivities',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.CASCADE,
        joinColumnName: 'targetCompanyId',
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  targetOpportunity: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.MORPH_RELATION,
      morphId: STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId,
      fieldName: 'targetOpportunity',
      label: i18nLabel(
        msg({ message: `Opportunity`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({ message: `Event target`, context: 'fieldMetadata.description' }),
      ),
      icon: 'IconTimelineEvent',
      isNullable: true,
      isUIEditable: false,
      isSystemSideEffect: true,
      targetObjectName: 'opportunity',
      targetFieldName: 'timelineActivities',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName: 'targetOpportunityId',
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  targetNote: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.MORPH_RELATION,
      morphId: STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId,
      fieldName: 'targetNote',
      label: i18nLabel(
        msg({ message: `Note`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({ message: `Event target`, context: 'fieldMetadata.description' }),
      ),
      icon: 'IconTimelineEvent',
      isNullable: true,
      isUIEditable: false,
      isSystemSideEffect: true,
      targetObjectName: 'note',
      targetFieldName: 'timelineActivities',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName: 'targetNoteId',
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  targetTask: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.MORPH_RELATION,
      morphId: STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId,
      fieldName: 'targetTask',
      label: i18nLabel(
        msg({ message: `Task`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({ message: `Event target`, context: 'fieldMetadata.description' }),
      ),
      icon: 'IconTimelineEvent',
      isNullable: true,
      isUIEditable: false,
      isSystemSideEffect: true,
      targetObjectName: 'task',
      targetFieldName: 'timelineActivities',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName: 'targetTaskId',
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  targetWorkflow: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.MORPH_RELATION,
      morphId: STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId,
      fieldName: 'targetWorkflow',
      label: i18nLabel(
        msg({ message: `Workflow`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({ message: `Event target`, context: 'fieldMetadata.description' }),
      ),
      icon: 'IconTimelineEvent',
      isNullable: true,
      isUIEditable: false,
      isSystemSideEffect: true,
      targetObjectName: 'workflow',
      targetFieldName: 'timelineActivities',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.CASCADE,
        joinColumnName: 'targetWorkflowId',
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  targetWorkflowVersion: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.MORPH_RELATION,
      morphId: STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId,
      fieldName: 'targetWorkflowVersion',
      label: i18nLabel(
        msg({ message: `WorkflowVersion`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({ message: `Event target`, context: 'fieldMetadata.description' }),
      ),
      icon: 'IconTimelineEvent',
      isNullable: true,
      isUIEditable: false,
      isSystemSideEffect: true,
      targetObjectName: 'workflowVersion',
      targetFieldName: 'timelineActivities',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.CASCADE,
        joinColumnName: 'targetWorkflowVersionId',
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  targetWorkflowRun: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.MORPH_RELATION,
      morphId: STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId,
      fieldName: 'targetWorkflowRun',
      label: i18nLabel(
        msg({ message: `WorkflowRun`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({ message: `Event target`, context: 'fieldMetadata.description' }),
      ),
      icon: 'IconTimelineEvent',
      isNullable: true,
      isUIEditable: false,
      isSystemSideEffect: true,
      targetObjectName: 'workflowRun',
      targetFieldName: 'timelineActivities',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.CASCADE,
        joinColumnName: 'targetWorkflowRunId',
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  targetDashboard: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.MORPH_RELATION,
      morphId: STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId,
      fieldName: 'targetDashboard',
      label: i18nLabel(
        msg({ message: `Dashboard`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({ message: `Event target`, context: 'fieldMetadata.description' }),
      ),
      icon: 'IconTimelineEvent',
      isNullable: true,
      isUIEditable: false,
      isSystemSideEffect: true,
      targetObjectName: 'dashboard',
      targetFieldName: 'timelineActivities',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName: 'targetDashboardId',
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  targetMessageList: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.MORPH_RELATION,
      morphId: STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId,
      fieldName: 'targetMessageList',
      label: i18nLabel(
        msg({ message: `MessageList`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({ message: `Event target`, context: 'fieldMetadata.description' }),
      ),
      icon: 'IconTimelineEvent',
      isNullable: true,
      isUIEditable: false,
      isSystemSideEffect: true,
      targetObjectName: 'messageList',
      targetFieldName: 'timelineActivities',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName: 'targetMessageListId',
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  targetMessageCampaign: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.MORPH_RELATION,
      morphId: STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId,
      fieldName: 'targetMessageCampaign',
      label: i18nLabel(
        msg({ message: `MessageCampaign`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({ message: `Event target`, context: 'fieldMetadata.description' }),
      ),
      icon: 'IconTimelineEvent',
      isNullable: true,
      isUIEditable: false,
      isSystemSideEffect: true,
      targetObjectName: 'messageCampaign',
      targetFieldName: 'timelineActivities',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName: 'targetMessageCampaignId',
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  searchVector: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'searchVector',
      type: FieldMetadataType.TS_VECTOR,
      label: i18nLabel(
        msg({ message: `Search vector`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Field used for full-text search`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconUser',
      isSystem: true,
      isNullable: true,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
});
