import { CalendarChannelEventAssociationRepository } from 'src/modules/calendar/repositories/calendar-channel-event-association/calendar-channel-event-association.repository';
import { CalendarChannelRepository } from 'src/modules/calendar/repositories/calendar-channel/calendar-channel.repository';
import { CalendarEventAttendeeRepository } from 'src/modules/calendar/repositories/calendar-event-attendee/calendar-event-attendee.repository';
import { CalendarEventRepository } from 'src/modules/calendar/repositories/calendar-event/calendar-event.repository';
import { CompanyRepository } from 'src/modules/company/repositories/company/company.repository';
import { BlocklistRepository } from 'src/modules/connected-account/repositories/blocklist/blocklist.repository';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account/connected-account.repository';
import { MessageChannelMessageAssociationRepository } from 'src/modules/messaging/repositories/message-channel-message-association/message-channel-message-association.repository';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel/message-channel.repository';
import { MessageParticipantRepository } from 'src/modules/messaging/repositories/message-participant/message-participant.repository';
import { MessageThreadRepository } from 'src/modules/messaging/repositories/message-thread/message-thread.repository';
import { MessageRepository } from 'src/modules/messaging/repositories/message/message.repository';
import { PersonRepository } from 'src/modules/person/repositories/person/person.repository';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member/workspace-member.repository';

export const metadataToRepositoryMapping = {
  BlocklistObjectMetadata: BlocklistRepository,
  CalendarChannelEventAssociationObjectMetadata:
    CalendarChannelEventAssociationRepository,
  CalendarChannelObjectMetadata: CalendarChannelRepository,
  CalendarEventAttendeeObjectMetadata: CalendarEventAttendeeRepository,
  CalendarEventObjectMetadata: CalendarEventRepository,
  CompanyObjectMetadata: CompanyRepository,
  ConnectedAccountObjectMetadata: ConnectedAccountRepository,
  MessageChannelMessageAssociationObjectMetadata:
    MessageChannelMessageAssociationRepository,
  MessageChannelObjectMetadata: MessageChannelRepository,
  MessageObjectMetadata: MessageRepository,
  MessageParticipantObjectMetadata: MessageParticipantRepository,
  MessageThreadObjectMetadata: MessageThreadRepository,
  PersonObjectMetadata: PersonRepository,
  WorkspaceMemberObjectMetadata: WorkspaceMemberRepository,
};
