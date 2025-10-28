import { Logger, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chunk from 'lodash.chunk';
import { Repository } from 'typeorm';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { UserVarsService } from 'src/engine/core-modules/user/user-vars/services/user-vars.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
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

  constructor(
    private readonly userService: UserService,
    private readonly userVarsService: UserVarsService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  @Process(CleanWorkspaceDeletionWarningUserVarsJob.name)
  async handle(
    data: CleanWorkspaceDeletionWarningUserVarsJobData,
  ): Promise<void> {
    this.logger.log(`Job running...`);

    const { workspaceId } = data;

    try {
      const workspace = await this.workspaceRepository.findOneOrFail({
        where: { id: workspaceId },
      });

      const workspaceMembers =
        await this.userService.loadWorkspaceMembers(workspace);

      const workspaceMembersChunks = chunk(workspaceMembers, 5);

      for (const workspaceMembersChunk of workspaceMembersChunks) {
        await Promise.all(
          workspaceMembersChunk.map(async (workspaceMember) => {
            await this.userVarsService.delete({
              userId: workspaceMember.userId,
              workspaceId: workspace.id,
              key: USER_WORKSPACE_DELETION_WARNING_SENT_KEY,
            });
            this.logger.log(
              `Successfully cleaned user vars for ${workspaceMember.userId} user in ${workspace.id} workspace`,
            );
          }),
        );
      }
      this.logger.log(`Job done!`);
    } catch (error) {
      this.logger.error(
        `Failed to clean ${workspaceId} workspace users deletion warning user vars: ${error.message}`,
      );
    }
  }
}
