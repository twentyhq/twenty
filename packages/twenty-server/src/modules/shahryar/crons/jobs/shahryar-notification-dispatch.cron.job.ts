import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { SHAHRYAR_NOTIFICATION_DISPATCH_CRON_PATTERN } from 'src/modules/shahryar/crons/shahryar-notification-dispatch.cron.pattern';
import { ShahryarNotificationService } from 'src/modules/shahryar/services/shahryar-notification.service';

@Processor(MessageQueue.cronQueue)
export class ShahryarNotificationDispatchCronJob {
  private readonly logger = new Logger(
    ShahryarNotificationDispatchCronJob.name,
  );

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly shahryarNotificationService: ShahryarNotificationService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  @Process(ShahryarNotificationDispatchCronJob.name)
  @SentryCronMonitor(
    ShahryarNotificationDispatchCronJob.name,
    SHAHRYAR_NOTIFICATION_DISPATCH_CRON_PATTERN,
  )
  async handle(): Promise<void> {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    for (const activeWorkspace of activeWorkspaces) {
      try {
        const result =
          await this.shahryarNotificationService.dispatchPendingNotifications({
            workspaceId: activeWorkspace.id,
          });

        if (result.attemptedCount === 0) {
          continue;
        }

        this.logger.log(
          `Dispatched ${result.sentCount}/${result.attemptedCount} Shahryar notifications for workspace ${activeWorkspace.id}`,
        );
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
