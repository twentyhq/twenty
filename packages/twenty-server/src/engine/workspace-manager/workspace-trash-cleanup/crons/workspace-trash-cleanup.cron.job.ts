import { Injectable } from '@nestjs/common';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WORKSPACE_TRASH_CLEANUP_CRON_PATTERN } from 'src/engine/workspace-manager/workspace-trash-cleanup/constants/workspace-trash-cleanup.constants';
import { WorkspaceTrashCleanupService } from 'src/engine/workspace-manager/workspace-trash-cleanup/services/workspace-trash-cleanup.service';

@Injectable()
@Processor(MessageQueue.cronQueue)
export class WorkspaceTrashCleanupCronJob {
  constructor(
    private readonly workspaceTrashCleanupService: WorkspaceTrashCleanupService,
  ) {}

  @Process(WorkspaceTrashCleanupCronJob.name)
  @SentryCronMonitor(
    WorkspaceTrashCleanupCronJob.name,
    WORKSPACE_TRASH_CLEANUP_CRON_PATTERN,
    30,
  )
  async handle(): Promise<void> {
    await this.workspaceTrashCleanupService.cleanupWorkspaceTrash();
  }
}
