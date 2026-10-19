import { CAMPAIGN_JOB_RETRY_LIMIT } from 'src/engine/core-modules/emailing-domain/constants/campaign-job-retry-limit.constant';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chunk from 'lodash.chunk';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { IsNull, Repository } from 'typeorm';

import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

const ENQUEUE_BATCH_SIZE = 500;

@Injectable()
export class CampaignSendingWorkspaceService {
  constructor(
    // Instance-wide sweep: it reads every active workspace to find which ones
    // have a sending domain, so there is no request workspace to scope by.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: Repository<EmailingDomainEntity>,
    @InjectMessageQueue(MessageQueue.campaignQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  async enqueueJobForEachSendingWorkspace(jobName: string): Promise<void> {
    const workspaceIds = await this.findSendingWorkspaceIds();

    for (const workspaceIdsBatch of chunk(workspaceIds, ENQUEUE_BATCH_SIZE)) {
      await this.messageQueueService
        .bulkAdd<{ workspaceId: string }>(
          jobName,
          workspaceIdsBatch.map((workspaceId) => ({ data: { workspaceId } })),
          { retryLimit: CAMPAIGN_JOB_RETRY_LIMIT },
        )
        .catch((error) => {
          this.exceptionHandlerService.captureExceptions([error]);
        });
    }
  }

  // A campaign only reaches SENDING with an emailing domain, so sweeps skip workspaces without one.
  private async findSendingWorkspaceIds(): Promise<string[]> {
    const emailingDomains = await this.emailingDomainRepository.find({
      select: { workspaceId: true },
      where: {
        workspace: {
          deletedAt: IsNull(),
          activationStatus: WorkspaceActivationStatus.ACTIVE,
        },
      },
    });

    return [...new Set(emailingDomains.map(({ workspaceId }) => workspaceId))];
  }
}
