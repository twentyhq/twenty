import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ConnectedAccountProvider, FeatureFlagKey } from 'twenty-shared/types';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { DataSource, Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { ImapIdleService } from 'src/modules/messaging/message-import-manager/drivers/imap/services/imap-idle.service';

export const MESSAGING_IMAP_IDLE_CRON_PATTERN = '*/5 * * * *';

@Processor(MessageQueue.cronQueue)
export class MessagingImapIdleCronJob {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly imapIdleService: ImapIdleService,
  ) {}

  @Process(MessagingImapIdleCronJob.name)
  @SentryCronMonitor(
    MessagingImapIdleCronJob.name,
    MESSAGING_IMAP_IDLE_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    for (const activeWorkspace of activeWorkspaces) {
      try {
        const isMigrated = await this.featureFlagService.isFeatureEnabled(
          FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED,
          activeWorkspace.id,
        );

        const workspaceSchema = getWorkspaceSchemaName(activeWorkspace.id);

        const messageChannels = isMigrated
          ? await this.coreDataSource.query(
              `SELECT mc.*, ca.provider, ca.id as "connectedAccountId" 
               FROM core."messageChannel" mc
               JOIN core."connectedAccount" ca ON mc."connectedAccountId" = ca.id
               WHERE mc."workspaceId" = '${activeWorkspace.id}' 
               AND mc."isSyncEnabled" = true 
               AND ca.provider IN ('${ConnectedAccountProvider.IMAP_SMTP_CALDAV}', '${ConnectedAccountProvider.GOOGLE}', '${ConnectedAccountProvider.MICROSOFT}')`
            )
          : await this.coreDataSource.query(
              `SELECT mc.*, ca.provider, ca.id as "connectedAccountId" 
               FROM ${workspaceSchema}."messageChannel" mc
               JOIN ${workspaceSchema}."connectedAccount" ca ON mc."connectedAccountId" = ca.id
               WHERE mc."isSyncEnabled" = true 
               AND ca.provider IN ('${ConnectedAccountProvider.IMAP_SMTP_CALDAV}', '${ConnectedAccountProvider.GOOGLE}', '${ConnectedAccountProvider.MICROSOFT}')`
            );

        for (const messageChannel of messageChannels) {
           // We need the full ConnectedAccountWorkspaceEntity for startIdle
           // For now, we manually construct a partial that matches the requirements
           // or we load it properly.
           const connectedAccount = isMigrated
             ? await this.coreDataSource.query(
                 `SELECT * FROM core."connectedAccount" WHERE id = '${messageChannel.connectedAccountId}'`
               ).then((res: any[]) => res[0]) as any
             : await this.coreDataSource.query(
                 `SELECT * FROM ${workspaceSchema}."connectedAccount" WHERE id = '${messageChannel.connectedAccountId}'`
               ).then((res: any[]) => res[0]) as any;

           if (connectedAccount) {
             await this.imapIdleService.startIdle(connectedAccount, activeWorkspace.id);
           }
        }
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: {
            id: activeWorkspace.id,
          },
        });
      }
    }
  }
}
