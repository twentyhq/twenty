import { BlocklistRepository } from 'src/modules/blocklist/repositories/blocklist.repository';
import { TimelineActivityRepository } from 'src/modules/timeline/repositories/timeline-activity.repository';

export const metadataToRepositoryMapping = {
  BlocklistWorkspaceEntity: BlocklistRepository,
  TimelineActivityWorkspaceEntity: TimelineActivityRepository,
};
