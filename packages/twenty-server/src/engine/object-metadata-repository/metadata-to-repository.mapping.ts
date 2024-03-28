import { CalendarChannelEventAssociationRepository } from 'src/apps/calendar/repositories/calendar-channel-event-association.repository';
import { CalendarChannelRepository } from 'src/apps/calendar/repositories/calendar-channel.repository';
import { CalendarEventAttendeeRepository } from 'src/apps/calendar/repositories/calendar-event-attendee.repository';
import { CalendarEventRepository } from 'src/apps/calendar/repositories/calendar-event.repository';
import { CompanyRepository } from 'src/apps/company/repositories/company.repository';
import { BlocklistRepository } from 'src/apps/connected-account/repositories/blocklist.repository';
import { ConnectedAccountRepository } from 'src/apps/connected-account/repositories/connected-account.repository';
import { EventRepository } from 'src/apps/event/repositiories/event.repository';
import { MessageChannelMessageAssociationRepository } from 'src/apps/messaging/repositories/message-channel-message-association.repository';
import { MessageChannelRepository } from 'src/apps/messaging/repositories/message-channel.repository';
import { MessageParticipantRepository } from 'src/apps/messaging/repositories/message-participant.repository';
import { MessageThreadRepository } from 'src/apps/messaging/repositories/message-thread.repository';
import { MessageRepository } from 'src/apps/messaging/repositories/message.repository';
import { PersonRepository } from 'src/apps/person/repositories/person.repository';
import { WorkspaceMemberRepository } from 'src/apps/workspace-member/repositories/workspace-member.repository';

export const metadataToRepositoryMapping = {
  BlocklistObjectMetadata: BlocklistRepository,
  CalendarChannelEventAssociationObjectMetadata:
    CalendarChannelEventAssociationRepository,
  CalendarChannelObjectMetadata: CalendarChannelRepository,
  CalendarEventAttendeeObjectMetadata: CalendarEventAttendeeRepository,
  CalendarEventObjectMetadata: CalendarEventRepository,
  CompanyObjectMetadata: CompanyRepository,
  ConnectedAccountObjectMetadata: ConnectedAccountRepository,
  EventObjectMetadata: EventRepository,
  MessageChannelMessageAssociationObjectMetadata:
    MessageChannelMessageAssociationRepository,
  MessageChannelObjectMetadata: MessageChannelRepository,
  MessageObjectMetadata: MessageRepository,
  MessageParticipantObjectMetadata: MessageParticipantRepository,
  MessageThreadObjectMetadata: MessageThreadRepository,
  PersonObjectMetadata: PersonRepository,
  WorkspaceMemberObjectMetadata: WorkspaceMemberRepository,
};
