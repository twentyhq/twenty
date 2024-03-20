import { Inject } from '@nestjs/common';

import { Command, CommandRunner, Option } from 'nest-commander';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import {
  GoogleCalendarFullSyncJobData,
  GoogleCalendarFullSyncJob,
} from 'src/modules/calendar/jobs/google-calendar-full-sync.job';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';

interface GoogleCalendarFullSyncOptions {
  workspaceId: string;
}

@Command({
  name: 'workspace:google-calendar-full-sync',
  description:
    'Start google calendar full-sync for all workspaceMembers in a workspace.',
})
export class GoogleCalendarFullSyncCommand extends CommandRunner {
  constructor(
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectObjectMetadataRepository(ConnectedAccountObjectMetadata)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: GoogleCalendarFullSyncOptions,
  ): Promise<void> {
    await this.fetchWorkspaceCalendars(options.workspaceId);

    return;
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  private async fetchWorkspaceCalendars(workspaceId: string): Promise<void> {
    const connectedAccounts =
      await this.connectedAccountRepository.getAll(workspaceId);

    for (const connectedAccount of connectedAccounts) {
      await this.messageQueueService.add<GoogleCalendarFullSyncJobData>(
        GoogleCalendarFullSyncJob.name,
        {
          workspaceId,
          connectedAccountId: connectedAccount.id,
        },
        {
          retryLimit: 2,
        },
      );
    }
  }
}
