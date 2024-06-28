import { InjectRepository } from '@nestjs/typeorm';
import { Scope } from '@nestjs/common';

import { Repository, In } from 'typeorm';

import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { WorkspaceGoogleCalendarSyncService } from 'src/modules/calendar/services/workspace-google-calendar-sync/workspace-google-calendar-sync.service';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { BillingService } from 'src/engine/core-modules/billing/billing.service';

@Processor({
  queueName: MessageQueue.cronQueue,
  scope: Scope.REQUEST,
})
export class GoogleCalendarSyncCronJob {
  constructor(
    @InjectRepository(DataSourceEntity, 'metadata')
    private readonly dataSourceRepository: Repository<DataSourceEntity>,
    private readonly workspaceGoogleCalendarSyncService: WorkspaceGoogleCalendarSyncService,
    private readonly billingService: BillingService,
  ) {}

  @Process(GoogleCalendarSyncCronJob.name)
  async handle(): Promise<void> {
    const workspaceIds =
      await this.billingService.getActiveSubscriptionWorkspaceIds();

    const dataSources = await this.dataSourceRepository.find({
      where: {
        workspaceId: In(workspaceIds),
      },
    });

    const workspaceIdsWithDataSources = new Set(
      dataSources.map((dataSource) => dataSource.workspaceId),
    );

    for (const workspaceId of workspaceIdsWithDataSources) {
      await this.workspaceGoogleCalendarSyncService.startWorkspaceGoogleCalendarSync(
        workspaceId,
      );
    }
  }
}
