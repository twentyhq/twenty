import { BlocklistRepository } from 'src/modules/blocklist/repositories/blocklist.repository';
import { CompanyRepository } from 'src/modules/company/repositories/company.repository';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { MessageChannelMessageAssociationRepository } from 'src/modules/messaging/common/repositories/message-channel-message-association.repository';
import { MessageChannelRepository } from 'src/modules/messaging/common/repositories/message-channel.repository';
import { MessageParticipantRepository } from 'src/modules/messaging/common/repositories/message-participant.repository';
import { MessageThreadRepository } from 'src/modules/messaging/common/repositories/message-thread.repository';
import { MessageRepository } from 'src/modules/messaging/common/repositories/message.repository';
import { PersonRepository } from 'src/modules/person/repositories/person.repository';
import { AuditLogRepository } from 'src/modules/timeline/repositiories/audit-log.repository';
import { TimelineActivityRepository } from 'src/modules/timeline/repositiories/timeline-activity.repository';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';

export const metadataToRepositoryMapping = {
  AuditLogWorkspaceEntity: AuditLogRepository,
  BlocklistWorkspaceEntity: BlocklistRepository,
  CompanyWorkspaceEntity: CompanyRepository,
  ConnectedAccountWorkspaceEntity: ConnectedAccountRepository,
  MessageChannelMessageAssociationWorkspaceEntity:
    MessageChannelMessageAssociationRepository,
  MessageChannelWorkspaceEntity: MessageChannelRepository,
  MessageWorkspaceEntity: MessageRepository,
  MessageParticipantWorkspaceEntity: MessageParticipantRepository,
  MessageThreadWorkspaceEntity: MessageThreadRepository,
  PersonWorkspaceEntity: PersonRepository,
  TimelineActivityWorkspaceEntity: TimelineActivityRepository,
  WorkspaceMemberWorkspaceEntity: WorkspaceMemberRepository,
};
