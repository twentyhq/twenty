import { CalendarChannelEventAssociationRepository } from 'src/modules/calendar/repositories/calendar-channel-event-association.repository';
import { CalendarChannelRepository } from 'src/modules/calendar/repositories/calendar-channel.repository';
import { CalendarEventParticipantRepository } from 'src/modules/calendar/repositories/calendar-event-participant.repository';
import { CalendarEventRepository } from 'src/modules/calendar/repositories/calendar-event.repository';
import { CompanyRepository } from 'src/modules/company/repositories/company.repository';
import { BlocklistRepository } from 'src/modules/connected-account/repositories/blocklist.repository';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { EventRepository } from 'src/modules/event/repositiories/event.repository';
import { MessageChannelMessageAssociationRepository } from 'src/modules/messaging/repositories/message-channel-message-association.repository';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { MessageParticipantRepository } from 'src/modules/messaging/repositories/message-participant.repository';
import { MessageThreadRepository } from 'src/modules/messaging/repositories/message-thread.repository';
import { MessageRepository } from 'src/modules/messaging/repositories/message.repository';
import { PersonRepository } from 'src/modules/person/repositories/person.repository';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';

export const metadataToRepositoryMapping = {
  BlocklistObjectMetadata: BlocklistRepository,
  CalendarChannelEventAssociationObjectMetadata:
    CalendarChannelEventAssociationRepository,
  CalendarChannelObjectMetadata: CalendarChannelRepository,
  CalendarEventParticipantObjectMetadata: CalendarEventParticipantRepository,
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
