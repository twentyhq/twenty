import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

export type DeleteWorkspaceMemberConnectedAccountsCleanupJobData = {
  workspaceId: string;
  workspaceMemberId: string;
};

@Processor(MessageQueue.deleteCascadeQueue)
export class DeleteWorkspaceMemberConnectedAccountsCleanupJob {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @Process(DeleteWorkspaceMemberConnectedAccountsCleanupJob.name)
  async handle(
    data: DeleteWorkspaceMemberConnectedAccountsCleanupJobData,
  ): Promise<void> {
    const { workspaceId, workspaceMemberId } = data;

    const connectedAccountRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ConnectedAccountWorkspaceEntity>(
        workspaceId,
        'connectedAccount',
      );

    await connectedAccountRepository.delete({
      accountOwnerId: workspaceMemberId,
    });
  }
}
