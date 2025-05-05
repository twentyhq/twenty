import { BlocklistRepository } from 'src/modules/blocklist/repositories/blocklist.repository';
import { TimelineActivityRepository } from 'src/modules/timeline/repositiories/timeline-activity.repository';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';

export const metadataToRepositoryMapping = {
  BlocklistWorkspaceEntity: BlocklistRepository,
  TimelineActivityWorkspaceEntity: TimelineActivityRepository,
  WorkspaceMemberWorkspaceEntity: WorkspaceMemberRepository,
};
