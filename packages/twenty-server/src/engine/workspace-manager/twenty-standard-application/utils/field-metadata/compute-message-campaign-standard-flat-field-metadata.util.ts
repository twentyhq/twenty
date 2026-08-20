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
export const buildMessageCampaignStandardFlatFieldMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  twentyStandardApplicationId,
}: Omit<
  CreateStandardFieldArgs<'messageCampaign', FieldMetadataType>,
  'context'
>): Record<
  AllStandardObjectFieldName<'messageCampaign'>,
  FlatFieldMetadata
> => {
  const base = {
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
    objectName,
    workspaceId,
  };

  return {
    id: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'id',
        type: FieldMetadataType.UUID,
        label: i18nLabel(
          msg({ message: `Id`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({ message: `Id`, context: 'fieldMetadata.description' }),
        ),
        icon: 'Icon123',
        isSystem: true,
        isNullable: false,
        isUIEditable: false,
        defaultValue: 'uuid',
      },
    }),
    createdAt: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'createdAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: `Creation date`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Creation date`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconCalendar',
        isSystem: true,
        isNullable: false,
        isUIEditable: false,
        defaultValue: 'now',
        settings: { displayFormat: DateDisplayFormat.RELATIVE },
      },
    }),
    updatedAt: createStandardFieldFlatMetadata({
      ...base,
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
    }),
    deletedAt: createStandardFieldFlatMetadata({
      ...base,
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
    }),
    createdBy: createStandardFieldFlatMetadata({
      ...base,
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
    }),
    updatedBy: createStandardFieldFlatMetadata({
      ...base,
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
    }),
    position: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'position',
        type: FieldMetadataType.POSITION,
        label: i18nLabel(
          msg({ message: `Position`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Email campaign record position`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconHierarchy2',
        isSystem: true,
        isNullable: false,
        defaultValue: 0,
      },
    }),
    searchVector: createStandardFieldFlatMetadata({
      ...base,
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
        icon: 'IconSend',
        isSystem: true,
        isNullable: true,
      },
    }),
    name: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'name',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: `Name`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Internal name of the campaign`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconAbc',
        isNullable: false,
        defaultValue: "''",
      },
    }),
    subject: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'subject',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: `Subject`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Email subject line`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconMail',
        isNullable: true,
        isUIEditable: false,
      },
    }),
    bodyTemplate: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'bodyTemplate',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(
          msg({ message: `Body`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Email body sent to recipients`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconFileText',
        isNullable: true,
        isUIEditable: false,
      },
    }),
    fromAddress: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'fromAddress',
        type: FieldMetadataType.EMAILS,
        label: i18nLabel(
          msg({ message: `From address`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Sender address for the campaign`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconAt',
        isNullable: true,
        isUIEditable: false,
        settings: {
          maxNumberOfValues: 1,
        },
      },
    }),
    status: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'status',
        type: FieldMetadataType.SELECT,
        label: i18nLabel(
          msg({ message: `Status`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Campaign lifecycle status`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconProgress',
        isNullable: false,
        isUIEditable: false,
        defaultValue: "'DRAFT'",
        options: [
          {
            id: '2bebe786-69e0-4673-8781-a85588b77c44',
            value: 'DRAFT',
            label: i18nLabel(
              msg({ message: `Draft`, context: 'fieldMetadata.label' }),
            ),
            position: 0,
            color: 'gray',
          },
          {
            id: 'dba0c513-d1dc-4c6a-980a-40795bdb0759',
            value: 'SCHEDULED',
            label: i18nLabel(
              msg({ message: `Scheduled`, context: 'fieldMetadata.label' }),
            ),
            position: 1,
            color: 'blue',
          },
          {
            id: '575b9ed5-1123-480c-9821-c73410841347',
            value: 'SENDING',
            label: i18nLabel(
              msg({ message: `Sending`, context: 'fieldMetadata.label' }),
            ),
            position: 2,
            color: 'yellow',
          },
          {
            id: '0c311eae-0892-4319-84e6-b30e921dc01a',
            value: 'SENT',
            label: i18nLabel(
              msg({ message: `Sent`, context: 'fieldMetadata.label' }),
            ),
            position: 3,
            color: 'green',
          },
          {
            id: 'c309536c-ceb7-4510-8481-c2cbd88ffe96',
            value: 'SENT_WITH_ERRORS',
            label: i18nLabel(
              msg({
                message: `Sent with errors`,
                context: 'fieldMetadata.label',
              }),
            ),
            position: 4,
            color: 'orange',
          },
        ],
      },
    }),
    sentAt: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'sentAt',
        type: FieldMetadataType.DATE_TIME,
        label: i18nLabel(
          msg({ message: `Sent at`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `When the campaign finished sending`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconSend',
        isNullable: true,
        isUIEditable: false,
        settings: { displayFormat: DateDisplayFormat.RELATIVE },
      },
    }),
    sentCount: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'sentCount',
        type: FieldMetadataType.NUMBER,
        label: i18nLabel(
          msg({ message: `Sent count`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Number of emails sent`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconMailFast',
        isNullable: false,
        isUIEditable: false,
        defaultValue: 0,
      },
    }),
    failedCount: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'failedCount',
        type: FieldMetadataType.NUMBER,
        label: i18nLabel(
          msg({ message: `Failed count`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Number of emails that failed to send`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconMailX',
        isNullable: false,
        isUIEditable: false,
        defaultValue: 0,
      },
    }),
    bouncedCount: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'bouncedCount',
        type: FieldMetadataType.NUMBER,
        label: i18nLabel(
          msg({ message: `Bounced count`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Number of emails that bounced`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconMailOff',
        isNullable: false,
        isUIEditable: false,
        defaultValue: 0,
      },
    }),
    complainedCount: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'complainedCount',
        type: FieldMetadataType.NUMBER,
        label: i18nLabel(
          msg({ message: `Complained count`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Number of spam complaints received`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconMoodSad',
        isNullable: false,
        isUIEditable: false,
        defaultValue: 0,
      },
    }),
    unsubscribeTopicId: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'unsubscribeTopicId',
        type: FieldMetadataType.UUID,
        label: i18nLabel(
          msg({
            message: `Unsubscribe topic id`,
            context: 'fieldMetadata.label',
          }),
        ),
        description: i18nLabel(
          msg({
            message: `The unsubscribe topic this campaign was sent under`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconMailbox',
        isNullable: true,
        isUIEditable: false,
      },
    }),
    list: createStandardRelationFieldFlatMetadata({
      ...base,
      context: {
        type: FieldMetadataType.RELATION,
        morphId: null,
        fieldName: 'list',
        label: i18nLabel(
          msg({ message: `List`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `The list this campaign was sent to`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconUsersGroup',
        isNullable: true,
        isUIEditable: false,
        targetObjectName: 'messageList',
        targetFieldName: 'campaigns',
        settings: {
          relationType: RelationType.MANY_TO_ONE,
          onDelete: RelationOnDeleteAction.SET_NULL,
          joinColumnName: 'listId',
        },
      },
    }),
    timelineActivities: createStandardRelationFieldFlatMetadata({
      ...base,
      context: {
        type: FieldMetadataType.RELATION,
        morphId: null,
        fieldName: 'timelineActivities',
        isSystemSideEffect: true,
        label: i18nLabel(
          msg({ message: `Events`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Events linked to the campaign`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconTimelineEvent',
        isNullable: true,
        targetObjectName: 'timelineActivity',
        targetFieldName: 'targetMessageCampaign',
        settings: {
          relationType: RelationType.ONE_TO_MANY,
        },
      },
    }),
    messages: createStandardRelationFieldFlatMetadata({
      ...base,
      context: {
        type: FieldMetadataType.RELATION,
        morphId: null,
        fieldName: 'messages',
        label: i18nLabel(
          msg({ message: `Messages`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `Messages sent as part of this campaign`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconMessage',
        isNullable: true,
        isUIEditable: false,
        targetObjectName: 'message',
        targetFieldName: 'messageCampaign',
        settings: {
          relationType: RelationType.ONE_TO_MANY,
        },
      },
    }),
    recipients: createStandardRelationFieldFlatMetadata({
      ...base,
      context: {
        type: FieldMetadataType.RELATION,
        morphId: null,
        fieldName: 'recipients',
        label: i18nLabel(
          msg({ message: `Recipients`, context: 'fieldMetadata.label' }),
        ),
        description: i18nLabel(
          msg({
            message: `The people this campaign was sent to`,
            context: 'fieldMetadata.description',
          }),
        ),
        icon: 'IconUsers',
        isNullable: true,
        isUIEditable: false,
        targetObjectName: 'messageParticipant',
        targetFieldName: 'messageCampaign',
        settings: {
          relationType: RelationType.ONE_TO_MANY,
        },
      },
    }),
  };
};
