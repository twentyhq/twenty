import { BlocklistRepository } from 'src/modules/blocklist/repositories/blocklist.repository';
import { TimelineActivityRepository } from 'src/modules/timeline/repositiories/timeline-activity.repository';

export const metadataToRepositoryMapping = {
  BlocklistWorkspaceEntity: BlocklistRepository,
  TimelineActivityWorkspaceEntity: TimelineActivityRepository,
};
