import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@Command({
  name: 'messaging:relaunch-failed-message-channels',
  description: 'Relaunch failed message channels',
})
export class MessagingRelaunchFailedMessageChannelCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace)
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    try {
      const messageChannelRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageChannelWorkspaceEntity>(
          workspaceId,
          'messageChannel',
          { shouldBypassPermissionChecks: true },
        );

      const failedMessageChannels = await messageChannelRepository.find({
        where: {
          syncStage: MessageChannelSyncStage.FAILED,
        },
      });

      if (!options.dryRun && failedMessageChannels.length > 0) {
        await messageChannelRepository.update(
          failedMessageChannels.map(({ id }) => id),
          {
            syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
            syncStatus: MessageChannelSyncStatus.ACTIVE,
          },
        );
      }

      this.logger.log(
        `${options.dryRun ? ' (DRY RUN): ' : ''}Relaunched ${failedMessageChannels.length} failed message channels`,
      );
    } catch (error) {
      this.logger.error(
        'Error while relaunching failed message channels',
        error,
      );
    }
  }
}
