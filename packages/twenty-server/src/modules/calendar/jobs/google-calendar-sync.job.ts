import { Logger, Scope } from '@nestjs/common';

import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/services/google-api-refresh-access-token/google-api-refresh-access-token.service';
import { GoogleCalendarSyncService } from 'src/modules/calendar/services/google-calendar-sync/google-calendar-sync.service';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';

export type GoogleCalendarSyncJobData = {
  workspaceId: string;
  connectedAccountId: string;
};

@Processor({
  queueName: MessageQueue.calendarQueue,
  scope: Scope.REQUEST,
})
export class GoogleCalendarSyncJob {
  private readonly logger = new Logger(GoogleCalendarSyncJob.name);

  constructor(
    private readonly googleAPIsRefreshAccessTokenService: GoogleAPIRefreshAccessTokenService,
    private readonly googleCalendarSyncService: GoogleCalendarSyncService,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
  ) {}

  @Process(GoogleCalendarSyncJob.name)
  async handle(data: GoogleCalendarSyncJobData): Promise<void> {
    this.logger.log(
      `google calendar sync for workspace ${data.workspaceId} and account ${data.connectedAccountId}`,
    );
    try {
      const { connectedAccountId, workspaceId } = data;

      const connectedAccount = await this.connectedAccountRepository.getById(
        connectedAccountId,
        workspaceId,
      );

      if (!connectedAccount) {
        throw new Error(
          `No connected account found for ${connectedAccountId} in workspace ${workspaceId}`,
        );
      }

      await this.googleAPIsRefreshAccessTokenService.refreshAndSaveAccessToken(
        connectedAccount,
        workspaceId,
      );
    } catch (e) {
      this.logger.error(
        `Error refreshing access token for connected account ${data.connectedAccountId} in workspace ${data.workspaceId}`,
        e,
      );

      return;
    }

    await this.googleCalendarSyncService.startGoogleCalendarSync(
      data.workspaceId,
      data.connectedAccountId,
    );
  }
}
