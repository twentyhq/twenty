/* @license Enterprise */

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { SYNC_ACCESS_GROUPS_JOB_NAME } from 'src/engine/permissions/internal/access-group/constants/sync-access-groups-job-name.constant';
import { AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { type SyncAccessGroupsJobData } from 'src/engine/permissions/internal/access-group/types/sync-access-groups-job-data.type';

@Processor(MessageQueue.accessGroupQueue)
export class SyncAccessGroupsJob {
  constructor(
    private readonly accessGroupSyncService: AccessGroupSyncService,
  ) {}

  @Process(SYNC_ACCESS_GROUPS_JOB_NAME)
  async handle({ workspaceId }: SyncAccessGroupsJobData): Promise<void> {
    await this.accessGroupSyncService.syncAccessGroups(workspaceId);
  }
}
