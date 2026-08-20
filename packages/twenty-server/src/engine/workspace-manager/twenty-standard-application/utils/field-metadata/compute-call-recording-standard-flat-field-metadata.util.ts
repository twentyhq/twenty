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
import { CallRecordingRequestStatus } from 'src/modules/call-recording/common/enums/call-recording-request-status.enum';
import { CallRecordingStatus } from 'src/modules/call-recording/common/enums/call-recording-status.enum';

export const buildCallRecordingStandardFlatFieldMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  twentyStandardApplicationId,
}: Omit<
  CreateStandardFieldArgs<'callRecording', FieldMetadataType>,
  'context'
>): Record<AllStandardObjectFieldName<'callRecording'>, FlatFieldMetadata> => ({
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
  title: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'title',
      type: FieldMetadataType.TEXT,
      label: i18nLabel(
        msg({ message: `Title`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Meeting title from the calendar event`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconNotes',
      isNullable: true,
      isUIEditable: false,
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
          message: `Recording lifecycle status`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconProgress',
      isNullable: false,
      isUIEditable: false,
      defaultValue: "'SCHEDULED'",
      options: [
        {
          id: '7fa515ba-e3cb-48f7-914f-e1f664d5d920',
          value: CallRecordingStatus.SCHEDULED,
          label: i18nLabel(
            msg({ message: `Scheduled`, context: 'fieldMetadata.label' }),
          ),
          position: 0,
          color: 'sky',
        },
        {
          id: '96844ba3-364b-4975-8abc-886cca92ec99',
          value: CallRecordingStatus.JOINING,
          label: i18nLabel(
            msg({ message: `Joining`, context: 'fieldMetadata.label' }),
          ),
          position: 1,
          color: 'blue',
        },
        {
          id: 'eccdad8b-8424-48ba-ad7f-f38517fa83fc',
          value: CallRecordingStatus.RECORDING,
          label: i18nLabel(
            msg({ message: `Recording`, context: 'fieldMetadata.label' }),
          ),
          position: 2,
          color: 'red',
        },
        {
          id: 'c8222203-5b44-4ac6-8142-0a7eb2074d7b',
          value: CallRecordingStatus.PROCESSING,
          label: i18nLabel(
            msg({ message: `Processing`, context: 'fieldMetadata.label' }),
          ),
          position: 3,
          color: 'orange',
        },
        {
          id: 'd17faf71-af3c-4260-9021-2ffaaa5648c4',
          value: CallRecordingStatus.COMPLETED,
          label: i18nLabel(
            msg({ message: `Completed`, context: 'fieldMetadata.label' }),
          ),
          position: 4,
          color: 'green',
        },
        {
          id: '4800777e-54a8-4464-9c01-07d6eefd04da',
          value: CallRecordingStatus.FAILED,
          label: i18nLabel(
            msg({ message: `Failed`, context: 'fieldMetadata.label' }),
          ),
          position: 5,
          color: 'gray',
        },
        {
          id: 'cbd14df8-9cc2-4399-92f5-31fc41f3768b',
          value: CallRecordingStatus.NOT_RECORDED,
          label: i18nLabel(
            msg({ message: `Not recorded`, context: 'fieldMetadata.label' }),
          ),
          position: 6,
          color: 'yellow',
        },
      ],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  recordingRequestStatus: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'recordingRequestStatus',
      type: FieldMetadataType.SELECT,
      label: i18nLabel(
        msg({ message: `Request Status`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Recording request status`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconCircleCheck',
      isNullable: false,
      isUIEditable: false,
      defaultValue: "'REQUESTED'",
      options: [
        {
          id: 'fe992923-2f51-494d-bb32-42e96a703778',
          value: CallRecordingRequestStatus.REQUESTED,
          label: i18nLabel(
            msg({ message: `Requested`, context: 'fieldMetadata.label' }),
          ),
          position: 0,
          color: 'sky',
        },
        {
          id: '485767c2-2dda-4b83-91d8-6025cdb4b9df',
          value: CallRecordingRequestStatus.CANCELED,
          label: i18nLabel(
            msg({ message: `Canceled`, context: 'fieldMetadata.label' }),
          ),
          position: 1,
          color: 'gray',
        },
      ],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  applicationId: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'applicationId',
      type: FieldMetadataType.UUID,
      label: i18nLabel(
        msg({ message: `Application ID`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Installed source app that manages or ingested this recording`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconApps',
      isNullable: true,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  externalBotId: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'externalBotId',
      type: FieldMetadataType.TEXT,
      label: i18nLabel(
        msg({ message: `External Bot ID`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Source app bot/session id, when the source supports bots`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconRobot',
      isNullable: true,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  externalRecordingId: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'externalRecordingId',
      type: FieldMetadataType.TEXT,
      label: i18nLabel(
        msg({
          message: `External Recording ID`,
          context: 'fieldMetadata.label',
        }),
      ),
      description: i18nLabel(
        msg({
          message: `Source app recording id, when present`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconId',
      isNullable: true,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  startedAt: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'startedAt',
      type: FieldMetadataType.DATE_TIME,
      label: i18nLabel(
        msg({ message: `Started At`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Actual recording start`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconCalendarClock',
      isNullable: true,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  endedAt: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'endedAt',
      type: FieldMetadataType.DATE_TIME,
      label: i18nLabel(
        msg({ message: `Ended At`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Actual recording end`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconCalendarClock',
      isNullable: true,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  video: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'video',
      type: FieldMetadataType.FILES,
      label: i18nLabel(
        msg({ message: `Video`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Video recording`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconVideo',
      isNullable: true,
      isUIEditable: false,
      settings: {
        maxNumberOfValues: 1,
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  audio: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'audio',
      type: FieldMetadataType.FILES,
      label: i18nLabel(
        msg({ message: `Audio`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Audio-only recording`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconHeadphones',
      isNullable: true,
      isUIEditable: false,
      settings: {
        maxNumberOfValues: 1,
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  transcript: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'transcript',
      type: FieldMetadataType.RAW_JSON,
      label: i18nLabel(
        msg({ message: `Transcript`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Normalized diarized transcript`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconFileText',
      isNullable: true,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  summary: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'summary',
      type: FieldMetadataType.RICH_TEXT,
      label: i18nLabel(
        msg({ message: `Summary`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Recording summary`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconFileText',
      isNullable: true,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  calendarEvent: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.RELATION,
      morphId: null,
      fieldName: 'calendarEvent',
      label: i18nLabel(
        msg({ message: `Calendar Event`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Calendar Event`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconCalendar',
      isNullable: true,
      isUIEditable: false,
      targetObjectName: 'calendarEvent',
      targetFieldName: 'callRecordings',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        onDelete: RelationOnDeleteAction.SET_NULL,
        joinColumnName: 'calendarEventId',
      },
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
});
