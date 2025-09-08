import { Injectable, Logger } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { SInvoiceIntegrationService } from 'src/mkt-core/invoice/integration/s-invoice.integration.service';

export interface SInvoiceIntegrationJobData {
  orderId: string;
  workspaceId: string;
}

@Injectable()
@Processor(MessageQueue.billingQueue)
export class SInvoiceIntegrationJob {
  private readonly logger = new Logger(SInvoiceIntegrationJob.name);

  constructor(
    private readonly sInvoiceIntegrationService: SInvoiceIntegrationService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  @Process(SInvoiceIntegrationJob.name)
  async handle(data: SInvoiceIntegrationJobData): Promise<void> {
    this.logger.log(
      `[S-INVOICE JOB] Starting S-Invoice integration job for order: ${data.orderId}, workspace: ${data.workspaceId}`,
    );
    this.logger.log(
      `[S-INVOICE JOB] Job data received: ${JSON.stringify(data)}`,
    );

    try {
      this.logger.log(
        `[S-INVOICE JOB] Calling syncSInvoice service for order: ${data.orderId}`,
      );

      await this.sInvoiceIntegrationService.syncSInvoice(data.orderId);

      this.logger.log(
        `[S-INVOICE JOB] Successfully completed S-Invoice integration for order: ${data.orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `[S-INVOICE JOB] Failed to process S-Invoice integration for order: ${data.orderId}`,
        error,
      );
      this.logger.error(
        `[S-INVOICE JOB] Error details: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
