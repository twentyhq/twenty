import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

export type DeleteWorkspaceMemberConnectedAccountsCleanupJobData = {
  workspaceId: string;
  workspaceMemberId: string;
};

@Processor(MessageQueue.deleteCascadeQueue)
export class DeleteWorkspaceMemberConnectedAccountsCleanupJob {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  @Process(DeleteWorkspaceMemberConnectedAccountsCleanupJob.name)
  async handle(
    data: DeleteWorkspaceMemberConnectedAccountsCleanupJobData,
  ): Promise<void> {
    const { workspaceId, workspaceMemberId } = data;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const connectedAccountRepository =
          await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
            workspaceId,
            'connectedAccount',
          );

        await connectedAccountRepository.delete({
          accountOwnerId: workspaceMemberId,
        });
      },
    );
  }
}
