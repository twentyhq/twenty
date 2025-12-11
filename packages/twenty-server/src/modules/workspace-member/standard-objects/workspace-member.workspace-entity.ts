import { registerEnumType } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import {
  FieldMetadataType,
  FullNameMetadata,
  NumberDataType,
  RelationOnDeleteAction,
} from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceIsUnique } from 'src/engine/twenty-orm/decorators/workspace-is-unique.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WORKSPACE_MEMBER_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import {
  type FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

export enum WorkspaceMemberDateFormatEnum {
  SYSTEM = 'SYSTEM',
  MONTH_FIRST = 'MONTH_FIRST',
  DAY_FIRST = 'DAY_FIRST',
  YEAR_FIRST = 'YEAR_FIRST',
}

export enum WorkspaceMemberTimeFormatEnum {
  SYSTEM = 'SYSTEM',
  HOUR_12 = 'HOUR_12',
  HOUR_24 = 'HOUR_24',
}

export enum WorkspaceMemberNumberFormatEnum {
  SYSTEM = 'SYSTEM',
  COMMAS_AND_DOT = 'COMMAS_AND_DOT',
  SPACES_AND_COMMA = 'SPACES_AND_COMMA',
  DOTS_AND_COMMA = 'DOTS_AND_COMMA',
  APOSTROPHE_AND_DOT = 'APOSTROPHE_AND_DOT',
}

registerEnumType(WorkspaceMemberNumberFormatEnum, {
  name: 'WorkspaceMemberNumberFormatEnum',
  description: 'Number format for displaying numbers',
});

registerEnumType(WorkspaceMemberTimeFormatEnum, {
  name: 'WorkspaceMemberTimeFormatEnum',
  description: 'Time time as Military, Standard or system as default',
});

registerEnumType(WorkspaceMemberDateFormatEnum, {
  name: 'WorkspaceMemberDateFormatEnum',
  description:
    'Date format as Month first, Day first, Year first or system as default',
});

const NAME_FIELD_NAME = 'name';
const USER_EMAIL_FIELD_NAME = 'userEmail';

export const SEARCH_FIELDS_FOR_WORKSPACE_MEMBER: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.FULL_NAME },
  { name: USER_EMAIL_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.workspaceMember,

  namePlural: 'workspaceMembers',
  labelSingular: msg`Workspace Member`,
  labelPlural: msg`Workspace Members`,
  description: msg`A workspace member`,
  icon: STANDARD_OBJECT_ICONS.workspaceMember,
  labelIdentifierStandardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.name,
  imageIdentifierStandardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.avatarUrl,
})
@WorkspaceIsSystem()
@WorkspaceIsSearchable()
export class WorkspaceMemberWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Workspace member position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.FULL_NAME,
    label: msg`Name`,
    description: msg`Workspace member name`,
    icon: 'IconCircleUser',
  })
  @WorkspaceIsFieldUIReadOnly()
  name: FullNameMetadata;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.colorScheme,
    type: FieldMetadataType.TEXT,
    label: msg`Color Scheme`,
    description: msg`Preferred color scheme`,
    icon: 'IconColorSwatch',
    defaultValue: "'System'",
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsSystem()
  colorScheme: string;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.locale,
    type: FieldMetadataType.TEXT,
    label: msg`Language`,
    description: msg`Preferred language`,
    icon: 'IconLanguage',
    defaultValue: `'${SOURCE_LOCALE}'`,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsSystem()
  locale: keyof typeof APP_LOCALES;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.avatarUrl,
    type: FieldMetadataType.TEXT,
    label: msg`Avatar Url`,
    description: msg`Workspace member avatar`,
    icon: 'IconFileUpload',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  avatarUrl: string | null;

  @WorkspaceIsUnique()
  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.userEmail,
    type: FieldMetadataType.TEXT,
    label: msg`User Email`,
    description: msg`Related user email address`,
    icon: 'IconMail',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  userEmail: string | null;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.calendarStartDay,
    type: FieldMetadataType.NUMBER,
    label: msg`Start of the week`,
    defaultValue: 7,
    description: msg`User's preferred start day of the week`,
    settings: {
      dataType: NumberDataType.INT,
    },
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsSystem()
  calendarStartDay: number;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.userId,
    type: FieldMetadataType.UUID,
    label: msg`User Id`,
    description: msg`Associated User Id`,
    icon: 'IconCircleUsers',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsSystem()
  userId: string;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.timeZone,
    type: FieldMetadataType.TEXT,
    label: msg`Time zone`,
    defaultValue: "'system'",
    description: msg`User time zone`,
    icon: 'IconTimezone',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsSystem()
  timeZone: string;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.dateFormat,
    type: FieldMetadataType.SELECT,
    label: msg`Date format`,
    description: msg`User's preferred date format`,
    icon: 'IconCalendarEvent',
    options: [
      {
        value: WorkspaceMemberDateFormatEnum.SYSTEM,
        label: 'System',
        position: 0,
        color: 'turquoise',
      },
      {
        value: WorkspaceMemberDateFormatEnum.MONTH_FIRST,
        label: 'Month First',
        position: 1,
        color: 'red',
      },
      {
        value: WorkspaceMemberDateFormatEnum.DAY_FIRST,
        label: 'Day First',
        position: 2,
        color: 'purple',
      },
      {
        value: WorkspaceMemberDateFormatEnum.YEAR_FIRST,
        label: 'Year First',
        position: 3,
        color: 'sky',
      },
    ],
    defaultValue: `'${WorkspaceMemberDateFormatEnum.SYSTEM}'`,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsSystem()
  dateFormat: string;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.timeFormat,
    type: FieldMetadataType.SELECT,
    label: msg`Time format`,
    description: msg`User's preferred time format`,
    icon: 'IconClock2',
    options: [
      {
        value: WorkspaceMemberTimeFormatEnum.SYSTEM,
        label: 'System',
        position: 0,
        color: 'sky',
      },
      {
        value: WorkspaceMemberTimeFormatEnum.HOUR_24,
        label: '24HRS',
        position: 1,
        color: 'red',
      },
      {
        value: WorkspaceMemberTimeFormatEnum.HOUR_12,
        label: '12HRS',
        position: 2,
        color: 'purple',
      },
    ],
    defaultValue: `'${WorkspaceMemberTimeFormatEnum.SYSTEM}'`,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsSystem()
  timeFormat: string;

  // Relations
  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.assignedTasks,
    type: RelationType.ONE_TO_MANY,
    label: msg`Assigned tasks`,
    description: msg`Tasks assigned to the workspace member`,
    icon: 'IconCheckbox',
    inverseSideTarget: () => TaskWorkspaceEntity,
    inverseSideFieldKey: 'assignee',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsFieldUIReadOnly()
  assignedTasks: Relation<TaskWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.favorites,
    type: RelationType.ONE_TO_MANY,
    label: msg`Favorites`,
    description: msg`Favorites linked to the workspace member`,
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    inverseSideFieldKey: 'forWorkspaceMember',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.accountOwnerForCompanies,
    type: RelationType.ONE_TO_MANY,
    label: msg`Account Owner For Companies`,
    description: msg`Account owner for companies`,
    icon: 'IconBriefcase',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsFieldUIReadOnly()
  accountOwnerForCompanies: Relation<CompanyWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.authoredAttachments,
    type: RelationType.ONE_TO_MANY,
    label: msg`Authored attachments`,
    description: msg`Attachments created by the workspace member`,
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    inverseSideFieldKey: 'author',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsSystem()
  authoredAttachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.connectedAccounts,
    type: RelationType.ONE_TO_MANY,
    label: msg`Connected accounts`,
    description: msg`Connected accounts`,
    icon: 'IconAt',
    inverseSideTarget: () => ConnectedAccountWorkspaceEntity,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  connectedAccounts: Relation<ConnectedAccountWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.messageParticipants,
    type: RelationType.ONE_TO_MANY,
    label: msg`Message Participants`,
    description: msg`Message Participants`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => MessageParticipantWorkspaceEntity,
    inverseSideFieldKey: 'workspaceMember',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsFieldUIReadOnly()
  messageParticipants: Relation<MessageParticipantWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.blocklist,
    type: RelationType.ONE_TO_MANY,
    label: msg`Blocklist`,
    description: msg`Blocklisted handles`,
    icon: 'IconForbid2',
    inverseSideTarget: () => BlocklistWorkspaceEntity,
    inverseSideFieldKey: 'workspaceMember',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsFieldUIReadOnly()
  blocklist: Relation<BlocklistWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.calendarEventParticipants,
    type: RelationType.ONE_TO_MANY,
    label: msg`Calendar Event Participants`,
    description: msg`Calendar Event Participants`,
    icon: 'IconCalendar',
    inverseSideTarget: () => CalendarEventParticipantWorkspaceEntity,
    inverseSideFieldKey: 'workspaceMember',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsFieldUIReadOnly()
  calendarEventParticipants: Relation<
    CalendarEventParticipantWorkspaceEntity[]
  >;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Events`,
    description: msg`Events linked to the workspace member`,
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_WORKSPACE_MEMBER,
    ),
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.numberFormat,
    type: FieldMetadataType.SELECT,
    label: msg`Number format`,
    description: msg`User's preferred number format`,
    icon: 'IconNumbers',
    options: [
      {
        value: WorkspaceMemberNumberFormatEnum.SYSTEM,
        label: 'System',
        position: 0,
        color: 'turquoise',
      },
      {
        value: WorkspaceMemberNumberFormatEnum.COMMAS_AND_DOT,
        label: 'Commas and dot',
        position: 1,
        color: 'blue',
      },
      {
        value: WorkspaceMemberNumberFormatEnum.SPACES_AND_COMMA,
        label: 'Spaces and comma',
        position: 2,
        color: 'green',
      },
      {
        value: WorkspaceMemberNumberFormatEnum.DOTS_AND_COMMA,
        label: 'Dots and comma',
        position: 3,
        color: 'orange',
      },
      {
        value: WorkspaceMemberNumberFormatEnum.APOSTROPHE_AND_DOT,
        label: 'Apostrophe and dot',
        position: 4,
        color: 'purple',
      },
    ],
    defaultValue: `'${WorkspaceMemberNumberFormatEnum.SYSTEM}'`,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsSystem()
  numberFormat: string;
}
