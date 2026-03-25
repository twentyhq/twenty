import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ConnectedAccountDataAccessService } from 'src/engine/metadata-modules/connected-account/data-access/services/connected-account-data-access.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

export type DeleteWorkspaceMemberConnectedAccountsCleanupJobData = {
  workspaceId: string;
  workspaceMemberId: string;
};

@Processor(MessageQueue.deleteCascadeQueue)
export class DeleteWorkspaceMemberConnectedAccountsCleanupJob {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly connectedAccountDataAccessService: ConnectedAccountDataAccessService,
  ) {}

  @Process(DeleteWorkspaceMemberConnectedAccountsCleanupJob.name)
  async handle(
    data: DeleteWorkspaceMemberConnectedAccountsCleanupJobData,
  ): Promise<void> {
    const { workspaceId, workspaceMemberId } = data;

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.connectedAccountDataAccessService.delete(workspaceId, {
        accountOwnerId: workspaceMemberId,
      });
    }, authContext);
  }
}
