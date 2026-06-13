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
import { getTsVectorColumnExpressionFromFields } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { SEARCH_FIELDS_FOR_MESSAGE_CAMPAIGN } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';

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
        label: i18nLabel(msg`Id`),
        description: i18nLabel(msg`Id`),
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
        label: i18nLabel(msg`Creation date`),
        description: i18nLabel(msg`Creation date`),
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
        label: i18nLabel(msg`Last update`),
        description: i18nLabel(msg`Last time the record was changed`),
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
        label: i18nLabel(msg`Deleted at`),
        description: i18nLabel(msg`Date when the record was deleted`),
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
        label: i18nLabel(msg`Created by`),
        description: i18nLabel(msg`The creator of the record`),
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
        label: i18nLabel(msg`Updated by`),
        description: i18nLabel(
          msg`The workspace member who last updated the record`,
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
        label: i18nLabel(msg`Position`),
        description: i18nLabel(msg`Email campaign record position`),
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
        label: i18nLabel(msg`Search vector`),
        description: i18nLabel(msg`Field used for full-text search`),
        icon: 'IconSend',
        isSystem: true,
        isNullable: true,
        settings: {
          generatedType: 'STORED',
          asExpression: getTsVectorColumnExpressionFromFields(
            SEARCH_FIELDS_FOR_MESSAGE_CAMPAIGN,
          ),
        },
      },
    }),
    subject: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'subject',
        type: FieldMetadataType.TEXT,
        label: i18nLabel(msg`Subject`),
        description: i18nLabel(msg`Email subject line`),
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
        label: i18nLabel(msg`Body`),
        description: i18nLabel(msg`Email body sent to recipients`),
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
        label: i18nLabel(msg`From address`),
        description: i18nLabel(msg`Sender address for the campaign`),
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
        label: i18nLabel(msg`Status`),
        description: i18nLabel(msg`Campaign lifecycle status`),
        icon: 'IconProgress',
        isNullable: false,
        isUIEditable: false,
        defaultValue: "'DRAFT'",
        options: [
          {
            id: '2bebe786-69e0-4673-8781-a85588b77c44',
            value: 'DRAFT',
            label: i18nLabel(msg`Draft`),
            position: 0,
            color: 'gray',
          },
          {
            id: 'dba0c513-d1dc-4c6a-980a-40795bdb0759',
            value: 'SCHEDULED',
            label: i18nLabel(msg`Scheduled`),
            position: 1,
            color: 'blue',
          },
          {
            id: '575b9ed5-1123-480c-9821-c73410841347',
            value: 'SENDING',
            label: i18nLabel(msg`Sending`),
            position: 2,
            color: 'yellow',
          },
          {
            id: '0c311eae-0892-4319-84e6-b30e921dc01a',
            value: 'SENT',
            label: i18nLabel(msg`Sent`),
            position: 3,
            color: 'green',
          },
          {
            id: 'c309536c-ceb7-4510-8481-c2cbd88ffe96',
            value: 'SENT_WITH_ERRORS',
            label: i18nLabel(msg`Sent with errors`),
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
        label: i18nLabel(msg`Sent at`),
        description: i18nLabel(msg`When the campaign finished sending`),
        icon: 'IconSend',
        isNullable: true,
        isUIEditable: false,
        settings: { displayFormat: DateDisplayFormat.RELATIVE },
      },
    }),
    unsubscribeTopicId: createStandardFieldFlatMetadata({
      ...base,
      context: {
        fieldName: 'unsubscribeTopicId',
        type: FieldMetadataType.UUID,
        label: i18nLabel(msg`Unsubscribe topic id`),
        description: i18nLabel(
          msg`The unsubscribe topic this campaign was sent under`,
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
        label: i18nLabel(msg`List`),
        description: i18nLabel(msg`The list this campaign was sent to`),
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
        label: i18nLabel(msg`Events`),
        description: i18nLabel(msg`Events linked to the campaign`),
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
        label: i18nLabel(msg`Messages`),
        description: i18nLabel(msg`Messages sent as part of this campaign`),
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
        label: i18nLabel(msg`Recipients`),
        description: i18nLabel(msg`The people this campaign was sent to`),
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
