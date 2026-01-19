import { registerEnumType } from '@nestjs/graphql';

import { type APP_LOCALES } from 'twenty-shared/translations';
import { FieldMetadataType, type FullNameMetadata } from 'twenty-shared/types';
import { type Relation } from 'typeorm';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { type BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { type CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { type CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { type TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';
import { type TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

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

export class WorkspaceMemberWorkspaceEntity extends BaseWorkspaceEntity {
  position: number;
  name: FullNameMetadata;
  colorScheme: string;
  locale: keyof typeof APP_LOCALES;
  avatarUrl: string | null;
  userEmail: string | null;
  calendarStartDay: number;
  userId: string;
  timeZone: string;
  dateFormat: string;
  timeFormat: string;
  assignedTasks: Relation<TaskWorkspaceEntity[]>;
  favorites: Relation<FavoriteWorkspaceEntity[]>;
  accountOwnerForCompanies: Relation<CompanyWorkspaceEntity[]>;
  authoredAttachments: Relation<AttachmentWorkspaceEntity[]>;
  connectedAccounts: Relation<ConnectedAccountWorkspaceEntity[]>;
  messageParticipants: Relation<MessageParticipantWorkspaceEntity[]>;
  blocklist: Relation<BlocklistWorkspaceEntity[]>;
  calendarEventParticipants: Relation<
    CalendarEventParticipantWorkspaceEntity[]
  >;
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;
  ownedOpportunities: Relation<OpportunityWorkspaceEntity[]>;
  searchVector: string;
  numberFormat: string;
}
