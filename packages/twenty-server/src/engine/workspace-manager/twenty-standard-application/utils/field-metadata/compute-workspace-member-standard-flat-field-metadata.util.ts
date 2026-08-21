import { msg } from '@lingui/core/macro';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import {
  DateDisplayFormat,
  FieldMetadataType,
  NumberDataType,
  RelationType,
  OpenRecordIn,
} from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import {
  type CreateStandardFieldArgs,
  createStandardFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-field-flat-metadata.util';
import { createStandardRelationFieldFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/create-standard-relation-field-flat-metadata.util';
import { WorkspaceMemberNumberFormatEnum } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export const buildWorkspaceMemberStandardFlatFieldMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  twentyStandardApplicationId,
}: Omit<
  CreateStandardFieldArgs<'workspaceMember', FieldMetadataType>,
  'context'
>): Record<
  AllStandardObjectFieldName<'workspaceMember'>,
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
          message: `Workspace member position`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconHierarchy2',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: 0,
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
      type: FieldMetadataType.FULL_NAME,
      label: i18nLabel(
        msg({ message: `Name`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Workspace member name`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconCircleUser',
      isNullable: false,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  colorScheme: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'colorScheme',
      type: FieldMetadataType.TEXT,
      label: i18nLabel(
        msg({ message: `Color Scheme`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Preferred color scheme`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconColorSwatch',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: "'System'",
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  uiScale: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'uiScale',
      type: FieldMetadataType.TEXT,
      label: i18nLabel(
        msg({ message: `Interface Scale`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Preferred interface scale`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconZoomScan',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: "'Default'",
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  openRecordIn: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'openRecordIn',
      type: FieldMetadataType.TEXT,
      label: i18nLabel(
        msg({ message: `Open Records In`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Where records open for objects that follow the member's preference`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconLayoutSidebarRight',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: `'${OpenRecordIn.SIDE_PANEL}'`,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  locale: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'locale',
      type: FieldMetadataType.TEXT,
      label: i18nLabel(
        msg({ message: `Language`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Preferred language`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconLanguage',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: "'en'",
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  avatarUrl: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'avatarUrl',
      type: FieldMetadataType.TEXT,
      label: i18nLabel(
        msg({ message: `Avatar Url`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Workspace member avatar`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconFileUpload',
      isSystem: true,
      isNullable: true,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  userEmail: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'userEmail',
      type: FieldMetadataType.TEXT,
      label: i18nLabel(
        msg({ message: `User Email`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Related user email address`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconMail',
      isSystem: true,
      isNullable: true,
      isUIEditable: false,
      isUnique: true,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  jobTitle: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'jobTitle',
      type: FieldMetadataType.TEXT,
      label: i18nLabel(
        msg({ message: `Job Title`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Workspace member job title`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconBriefcase',
      isSystem: true,
      isNullable: true,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  calendarStartDay: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'calendarStartDay',
      type: FieldMetadataType.NUMBER,
      label: i18nLabel(
        msg({ message: `Start of the week`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `User's preferred start day of the week`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconCalendar',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: 7,
      settings: {
        dataType: NumberDataType.INT,
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  userId: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'userId',
      type: FieldMetadataType.UUID,
      label: i18nLabel(
        msg({ message: `User Id`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Associated User Id`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconCircleUsers',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  timeZone: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'timeZone',
      type: FieldMetadataType.TEXT,
      label: i18nLabel(
        msg({ message: `Time zone`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `User time zone`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconTimezone',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: "'system'",
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  dateFormat: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'dateFormat',
      type: FieldMetadataType.SELECT,
      label: i18nLabel(
        msg({ message: `Date format`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `User's preferred date format`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconCalendarEvent',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: "'SYSTEM'",
      options: [
        {
          id: '20202020-4b6a-4a08-8506-09bd59ef118e',
          value: 'SYSTEM',
          label: i18nLabel(
            msg({ message: `System`, context: 'fieldMetadata.label' }),
          ),
          position: 0,
          color: 'turquoise',
        },
        {
          id: '20202020-6981-4e21-bb11-43ac1081be04',
          value: 'MONTH_FIRST',
          label: i18nLabel(
            msg({ message: `Month First`, context: 'fieldMetadata.label' }),
          ),
          position: 1,
          color: 'red',
        },
        {
          id: '20202020-bf56-4199-b013-27ee921d046d',
          value: 'DAY_FIRST',
          label: i18nLabel(
            msg({ message: `Day First`, context: 'fieldMetadata.label' }),
          ),
          position: 2,
          color: 'purple',
        },
        {
          id: '20202020-fd23-47d3-b01d-0479c11e5a2d',
          value: 'YEAR_FIRST',
          label: i18nLabel(
            msg({ message: `Year First`, context: 'fieldMetadata.label' }),
          ),
          position: 3,
          color: 'sky',
        },
      ],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  timeFormat: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'timeFormat',
      type: FieldMetadataType.SELECT,
      label: i18nLabel(
        msg({ message: `Time format`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `User's preferred time format`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconClock2',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: "'SYSTEM'",
      options: [
        {
          id: '20202020-349f-4ff8-82be-3eb52e7ec5f5',
          value: 'SYSTEM',
          label: i18nLabel(
            msg({ message: `System`, context: 'fieldMetadata.label' }),
          ),
          position: 0,
          color: 'sky',
        },
        {
          id: '20202020-592c-4e33-a457-f4dcde59a3fc',
          value: 'HOUR_24',
          label: i18nLabel(
            msg({ message: `24HRS`, context: 'fieldMetadata.label' }),
          ),
          position: 1,
          color: 'red',
        },
        {
          id: '20202020-151c-43c2-a463-5bc42e5ce434',
          value: 'HOUR_12',
          label: i18nLabel(
            msg({ message: `12HRS`, context: 'fieldMetadata.label' }),
          ),
          position: 2,
          color: 'purple',
        },
      ],
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  numberFormat: createStandardFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      fieldName: 'numberFormat',
      type: FieldMetadataType.SELECT,
      label: i18nLabel(
        msg({ message: `Number format`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `User's preferred number format`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconNumbers',
      isSystem: true,
      isNullable: false,
      isUIEditable: false,
      defaultValue: `'${WorkspaceMemberNumberFormatEnum.SYSTEM}'`,
      options: [
        {
          id: '20202020-8b5b-4cee-8449-ca48d7c65c11',
          value: WorkspaceMemberNumberFormatEnum.SYSTEM,
          label: i18nLabel(
            msg({ message: `System`, context: 'fieldMetadata.label' }),
          ),
          position: 0,
          color: 'turquoise',
        },
        {
          id: '20202020-657d-409b-9c2a-d8c3b8842859',
          value: WorkspaceMemberNumberFormatEnum.COMMAS_AND_DOT,
          label: i18nLabel(
            msg({ message: `Commas and dot`, context: 'fieldMetadata.label' }),
          ),
          position: 1,
          color: 'blue',
        },
        {
          id: '20202020-8703-4475-a92b-42e631851d8b',
          value: WorkspaceMemberNumberFormatEnum.SPACES_AND_COMMA,
          label: i18nLabel(
            msg({
              message: `Spaces and comma`,
              context: 'fieldMetadata.label',
            }),
          ),
          position: 2,
          color: 'green',
        },
        {
          id: '20202020-2ea4-4b99-b72b-bebac01fd7db',
          value: WorkspaceMemberNumberFormatEnum.DOTS_AND_COMMA,
          label: i18nLabel(
            msg({ message: `Dots and comma`, context: 'fieldMetadata.label' }),
          ),
          position: 3,
          color: 'orange',
        },
        {
          id: '20202020-9d07-4353-8ce9-d067d639abf5',
          value: WorkspaceMemberNumberFormatEnum.APOSTROPHE_AND_DOT,
          label: i18nLabel(
            msg({
              message: `Apostrophe and dot`,
              context: 'fieldMetadata.label',
            }),
          ),
          position: 4,
          color: 'purple',
        },
      ],
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
      isUIEditable: false,
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  assignedTasks: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.RELATION,
      morphId: null,
      fieldName: 'assignedTasks',
      label: i18nLabel(
        msg({ message: `Assigned tasks`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Tasks assigned to the workspace member`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconCheckbox',
      isNullable: false,
      isUIEditable: false,
      targetObjectName: 'task',
      targetFieldName: 'assignee',
      settings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  accountOwnerForCompanies: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.RELATION,
      morphId: null,
      fieldName: 'accountOwnerForCompanies',
      label: i18nLabel(
        msg({
          message: `Account Owner For Companies`,
          context: 'fieldMetadata.label',
        }),
      ),
      description: i18nLabel(
        msg({
          message: `Account owner for companies`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconBriefcase',
      isNullable: false,
      isUIEditable: false,
      targetObjectName: 'company',
      targetFieldName: 'accountOwner',
      settings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  messageParticipants: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.RELATION,
      morphId: null,
      fieldName: 'messageParticipants',
      label: i18nLabel(
        msg({
          message: `Message Participants`,
          context: 'fieldMetadata.label',
        }),
      ),
      description: i18nLabel(
        msg({
          message: `Message Participants`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconUserCircle',
      isNullable: false,
      isUIEditable: false,
      targetObjectName: 'messageParticipant',
      targetFieldName: 'workspaceMember',
      settings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  blocklist: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.RELATION,
      morphId: null,
      fieldName: 'blocklist',
      label: i18nLabel(
        msg({ message: `Blocklist`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Blocklisted handles`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconForbid2',
      isNullable: false,
      isUIEditable: false,
      targetObjectName: 'blocklist',
      targetFieldName: 'workspaceMember',
      settings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  calendarEventParticipants: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.RELATION,
      morphId: null,
      fieldName: 'calendarEventParticipants',
      label: i18nLabel(
        msg({
          message: `Calendar Event Participants`,
          context: 'fieldMetadata.label',
        }),
      ),
      description: i18nLabel(
        msg({
          message: `Calendar Event Participants`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconCalendar',
      isNullable: false,
      isUIEditable: false,
      targetObjectName: 'calendarEventParticipant',
      targetFieldName: 'workspaceMember',
      settings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  timelineActivities: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.RELATION,
      morphId: null,
      fieldName: 'timelineActivities',
      label: i18nLabel(
        msg({ message: `Events`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Events linked to the workspace member`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconTimelineEvent',
      isNullable: true,
      isUIEditable: false,
      targetObjectName: 'timelineActivity',
      targetFieldName: 'workspaceMember',
      settings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps,
    twentyStandardApplicationId,
    now,
  }),
  ownedOpportunities: createStandardRelationFieldFlatMetadata({
    objectName,
    workspaceId,
    context: {
      type: FieldMetadataType.RELATION,
      morphId: null,
      fieldName: 'ownedOpportunities',
      label: i18nLabel(
        msg({ message: `Owned opportunities`, context: 'fieldMetadata.label' }),
      ),
      description: i18nLabel(
        msg({
          message: `Opportunities owned by the workspace member`,
          context: 'fieldMetadata.description',
        }),
      ),
      icon: 'IconTargetArrow',
      isNullable: false,
      isUIEditable: false,
      targetObjectName: 'opportunity',
      targetFieldName: 'owner',
      settings: {
        relationType: RelationType.ONE_TO_MANY,
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
});
