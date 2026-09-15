import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { USER_WORKSPACE_DELETION_WARNING_SENT_KEY } from 'src/engine/workspace-manager/workspace-cleaner/constants/user-workspace-deletion-warning-sent-key.constant';

export type CleanWorkspaceDeletionWarningUserVarsJobData = {
  workspaceId: string;
};

@Processor({
  queueName: MessageQueue.workspaceQueue,
  scope: Scope.REQUEST,
})
export class CleanWorkspaceDeletionWarningUserVarsJob {
  protected readonly logger = new Logger(
    CleanWorkspaceDeletionWarningUserVarsJob.name,
  );

  constructor(private readonly userVarsService: UserVarsService) {}

  @Process(CleanWorkspaceDeletionWarningUserVarsJob.name)
  async handle(
    data: CleanWorkspaceDeletionWarningUserVarsJobData,
  ): Promise<void> {
    const { workspaceId } = data;

    try {
      await this.userVarsService.delete({
        workspaceId,
        key: USER_WORKSPACE_DELETION_WARNING_SENT_KEY,
      });
      this.logger.log(
        `Successfully cleaned deletion warning user vars for ${workspaceId} workspace`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to clean ${workspaceId} workspace users deletion warning user vars: ${error.message}`,
      );
    }
  }
}
