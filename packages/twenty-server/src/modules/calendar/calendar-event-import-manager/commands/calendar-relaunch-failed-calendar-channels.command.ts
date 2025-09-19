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
  CalendarChannelSyncStage,
  CalendarChannelSyncStatus,
  CalendarChannelWorkspaceEntity,
} from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { AccountsToReconnectService } from 'src/modules/connected-account/services/accounts-to-reconnect.service';

@Command({
  name: 'calendar:relaunch-failed-calendar-channels',
  description: 'Relaunch failed message channels',
})
export class CalendarRelaunchFailedCalendarChannelsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace)
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly accountsToReconnectService: AccountsToReconnectService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    try {
      const calendarChannelRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<CalendarChannelWorkspaceEntity>(
          workspaceId,
          'calendarChannel',
          { shouldBypassPermissionChecks: true },
        );

      const failedCalendarChannels = await calendarChannelRepository.find({
        where: {
          syncStage: CalendarChannelSyncStage.FAILED,
        },
        relations: {
          connectedAccount: {
            accountOwner: true,
          },
        },
      });

      if (!options.dryRun && failedCalendarChannels.length > 0) {
        await calendarChannelRepository.update(
          failedCalendarChannels.map(({ id }) => id),
          {
            syncStage:
              CalendarChannelSyncStage.CALENDAR_EVENT_LIST_FETCH_PENDING,
            syncStatus: CalendarChannelSyncStatus.ACTIVE,
          },
        );

        for (const failedCalendarChannel of failedCalendarChannels) {
          await this.accountsToReconnectService.removeAccountToReconnect(
            failedCalendarChannel.connectedAccount.accountOwner.userId,
            failedCalendarChannel.connectedAccountId,
            workspaceId,
          );
        }
      }

      this.logger.log(
        `${options.dryRun ? ' (DRY RUN): ' : ''}Relaunched ${failedCalendarChannels.length} failed calendar channels`,
      );
    } catch (error) {
      this.logger.error(
        'Error while relaunching failed message channels',
        error,
      );
    }
  }
}
