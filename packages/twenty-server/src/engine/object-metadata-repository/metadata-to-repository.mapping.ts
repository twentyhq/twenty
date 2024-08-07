import { BlocklistRepository } from 'src/modules/blocklist/repositories/blocklist.repository';
import { CompanyRepository } from 'src/modules/company/repositories/company.repository';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { MessageChannelRepository } from 'src/modules/messaging/common/repositories/message-channel.repository';
import { PersonRepository } from 'src/modules/person/repositories/person.repository';
import { AuditLogRepository } from 'src/modules/timeline/repositiories/audit-log.repository';
import { TimelineActivityRepository } from 'src/modules/timeline/repositiories/timeline-activity.repository';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';

export const metadataToRepositoryMapping = {
  AuditLogWorkspaceEntity: AuditLogRepository,
  BlocklistWorkspaceEntity: BlocklistRepository,
  CompanyWorkspaceEntity: CompanyRepository,
  ConnectedAccountWorkspaceEntity: ConnectedAccountRepository,

  MessageChannelWorkspaceEntity: MessageChannelRepository,
  PersonWorkspaceEntity: PersonRepository,
  TimelineActivityWorkspaceEntity: TimelineActivityRepository,
  WorkspaceMemberWorkspaceEntity: WorkspaceMemberRepository,
};
