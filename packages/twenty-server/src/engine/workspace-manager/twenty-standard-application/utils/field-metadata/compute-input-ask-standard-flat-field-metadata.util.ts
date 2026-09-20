import { msg } from '@lingui/core/macro';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import {
  DateDisplayFormat,
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import {
  type CreateStandardFieldArgs,
  createStandardFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-relation-field-flat-metadata.util';
import { InputAskSource } from 'src/modules/input-ask/enums/input-ask-source.enum';
import { InputAskStatus } from 'src/modules/input-ask/enums/input-ask-status.enum';

export const buildInputAskStandardFlatFieldMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  twentyStandardApplicationId,
}: Omit<
  CreateStandardFieldArgs<'inputAsk', FieldMetadataType>,
  'context'
>): Record<AllStandardObjectFieldName<'inputAsk'>, FlatFieldMetadata> => ({
  id: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'id',
      type: FieldMetadataType.UUID,
      label: i18nLabel(msg({ message: `ID`, context: 'fieldMetadata.label' })),
      description: i18nLabel(
        msg({ message: `ID`, context: 'fieldMetadata.description' }),
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
          message: `Call recording record position`,
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
  name: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'name',
      type: FieldMetadataType.TEXT,
      label: i18nLabel(
        msg({ message: `Name`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `What is being asked, in a few words`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconHelpCircle',
      isNullable: false,
      isUIEditable: false,
      defaultValue: "''",
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  status: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'status',
      type: FieldMetadataType.SELECT,
      label: i18nLabel(
        msg({ message: `Status`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Whether this ask is still waiting on someone`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconProgress',
      isNullable: false,
      isUIEditable: false,
      defaultValue: "'PENDING'",
      options: [
        {
          id: 'a1f9a9b6-0e2a-4f0c-9d37-8b4a6b7c1d01',
          value: InputAskStatus.PENDING,
          label: i18nLabel(
            msg({ message: `Pending`, context: 'fieldMetadata.label' }),
          ),
          position: 0,
          color: 'yellow',
        },
        {
          id: 'a1f9a9b6-0e2a-4f0c-9d37-8b4a6b7c1d02',
          value: InputAskStatus.ANSWERED,
          label: i18nLabel(
            msg({ message: `Answered`, context: 'fieldMetadata.label' }),
          ),
          position: 1,
          color: 'green',
        },
        {
          id: 'a1f9a9b6-0e2a-4f0c-9d37-8b4a6b7c1d03',
          value: InputAskStatus.CANCELED,
          label: i18nLabel(
            msg({ message: `Canceled`, context: 'fieldMetadata.label' }),
          ),
          position: 2,
          color: 'gray',
        },
        {
          id: 'a1f9a9b6-0e2a-4f0c-9d37-8b4a6b7c1d04',
          value: InputAskStatus.EXPIRED,
          label: i18nLabel(
            msg({ message: `Expired`, context: 'fieldMetadata.label' }),
          ),
          position: 3,
          color: 'red',
        },
      ],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  source: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'source',
      type: FieldMetadataType.SELECT,
      label: i18nLabel(
        msg({ message: `Source`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `What is blocked on the answer`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconAffiliate',
      isNullable: false,
      isUIEditable: false,
      defaultValue: "'WORKFLOW_RUN_STEP'",
      options: [
        {
          id: 'a1f9a9b6-0e2a-4f0c-9d37-8b4a6b7c2d01',
          value: InputAskSource.WORKFLOW_RUN_STEP,
          label: i18nLabel(
            msg({ message: `Workflow`, context: 'fieldMetadata.label' }),
          ),
          position: 0,
          color: 'blue',
        },
        {
          id: 'a1f9a9b6-0e2a-4f0c-9d37-8b4a6b7c2d02',
          value: InputAskSource.AGENT_CHAT,
          label: i18nLabel(
            msg({ message: `Chat`, context: 'fieldMetadata.label' }),
          ),
          position: 1,
          color: 'purple',
        },
        {
          id: 'ef00cb9f-d455-4096-a095-8a9567597157',
          value: InputAskSource.TOOL_CALL,
          label: i18nLabel(
            msg({ message: `Tool call`, context: 'fieldMetadata.label' }),
          ),
          position: 2,
          color: 'green',
        },
      ],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  form: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'form',
      type: FieldMetadataType.RAW_JSON,
      label: i18nLabel(
        msg({ message: `Form`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `The questions as they were asked`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconForms',
      isNullable: true,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  response: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'response',
      type: FieldMetadataType.RAW_JSON,
      label: i18nLabel(
        msg({ message: `Response`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `What was answered`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconMessageCheck',
      isNullable: true,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  answeredAt: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'answeredAt',
      type: FieldMetadataType.DATE_TIME,
      label: i18nLabel(
        msg({ message: `Answered at`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `When it was answered`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconCalendarCheck',
      isNullable: true,
      isUIEditable: false,
      settings: { displayFormat: DateDisplayFormat.RELATIVE },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  stepId: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'stepId',
      type: FieldMetadataType.UUID,
      label: i18nLabel(
        msg({ message: `Step ID`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Which step of the run is waiting`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'Icon123',
      isSystem: true,
      isNullable: true,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  toolCallId: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'toolCallId',
      // Text rather than UUID: a tool call id comes from the model provider
      // and is only unique within its message, not a uuid we mint.
      type: FieldMetadataType.TEXT,
      label: i18nLabel(
        msg({ message: `Tool call ID`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Which proposed tool call is waiting`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconTool',
      isSystem: true,
      isNullable: true,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  threadId: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      // The chat thread lives in the core schema, so this is a plain id rather
      // than a relation: a workspace object cannot point at a core row.
      fieldName: 'threadId',
      type: FieldMetadataType.UUID,
      label: i18nLabel(
        msg({ message: `Thread ID`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Which conversation the question was asked in`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'Icon123',
      isSystem: true,
      isNullable: true,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  assignee: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.RELATION,
      morphId: null,
      fieldName: 'assignee',
      label: i18nLabel(
        msg({ message: `Assignee`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Who owes the answer`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconUserCircle',
      isNullable: true,
      isUIEditable: false,
      targetObjectName: 'workspaceMember',
      targetFieldName: 'inputAsks',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName: 'assigneeId',
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  workflowRun: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.RELATION,
      morphId: null,
      fieldName: 'workflowRun',
      label: i18nLabel(
        msg({ message: `Workflow Run`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `The run that is waiting`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconSettingsAutomation',
      isNullable: true,
      isUIEditable: false,
      targetObjectName: 'workflowRun',
      targetFieldName: 'inputAsks',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.CASCADE,
        joinColumnName: 'workflowRunId',
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
});
