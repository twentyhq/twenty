import {
  ActorMetadata,
  EmailsMetadata,
  FieldMetadataType,
  PhonesMetadata,
  type FullNameMetadata,
  type LinksMetadata,
} from 'twenty-shared/types';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

const NAME_FIELD_NAME = 'name';
const EMAILS_FIELD_NAME = 'emails';
const PHONES_FIELD_NAME = 'phones';
const JOB_TITLE_FIELD_NAME = 'jobTitle';

export const SEARCH_FIELDS_FOR_PERSON: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.FULL_NAME },
  { name: EMAILS_FIELD_NAME, type: FieldMetadataType.EMAILS },
  { name: PHONES_FIELD_NAME, type: FieldMetadataType.PHONES },
  { name: JOB_TITLE_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class PersonWorkspaceEntity extends BaseWorkspaceEntity {
  name: FullNameMetadata | null;
  emails: EmailsMetadata;
  linkedinLink: LinksMetadata | null;
  xLink: LinksMetadata | null;
  jobTitle: string | null;
  phone: string | null;
  phones: PhonesMetadata;
  city: string | null;
  avatarUrl: string | null;
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
  company: Relation<CompanyWorkspaceEntity> | null;
  companyId: string | null;
  pointOfContactForOpportunities: Relation<OpportunityWorkspaceEntity[]>;
  taskTargets: Relation<TaskTargetWorkspaceEntity[]>;
  noteTargets: Relation<NoteTargetWorkspaceEntity[]>;
  favorites: Relation<FavoriteWorkspaceEntity[]>;
  attachments: Relation<AttachmentWorkspaceEntity[]>;
  messageParticipants: Relation<MessageParticipantWorkspaceEntity[]>;
  calendarEventParticipants: Relation<
    CalendarEventParticipantWorkspaceEntity[]
  >;
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;
  searchVector: string;
}
