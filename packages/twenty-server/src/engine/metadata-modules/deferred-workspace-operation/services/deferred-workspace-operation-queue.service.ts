import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyArray } from 'twenty-shared/utils';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { DeferredWorkspaceOperationEntity } from 'src/engine/metadata-modules/deferred-workspace-operation/deferred-workspace-operation.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { DEFERRED_WORKSPACE_OPERATION_JOB_PRIORITY } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferred-workspace-operation-job-priority.constant';
import { DEFERRED_WORKSPACE_OPERATION_MAX_ATTEMPTS } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferred-workspace-operation-max-attempts.constant';
import { DEFERRED_WORKSPACE_OPERATION_RETRY_BACKOFF } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferred-workspace-operation-retry-backoff.constant';
import { RUN_DEFERRED_WORKSPACE_OPERATIONS_JOB_NAME } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/run-deferred-workspace-operations-job-name.constant';
import { type DeferredWorkspaceOperation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation.type';

@Injectable()
export class DeferredWorkspaceOperationQueueService {
  private readonly logger = new Logger(
    DeferredWorkspaceOperationQueueService.name,
  );

  constructor(
    @InjectWorkspaceScopedRepository(DeferredWorkspaceOperationEntity)
    private readonly deferredWorkspaceOperationRepository: WorkspaceScopedRepository<DeferredWorkspaceOperationEntity>,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async persistAndEnqueue({
    deferredOperations,
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    deferredOperations: DeferredWorkspaceOperation[];
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    if (!isNonEmptyArray(deferredOperations)) {
      return;
    }

    await this.deferredWorkspaceOperationRepository.insert(
      workspaceId,
      deferredOperations.map(
        ({ name, payload }, position) =>
          ({
            applicationUniversalIdentifier,
            name,
            payload,
            position,
            runByVersion: this.twentyConfigService.get('APP_VERSION') ?? null,
          }) as QueryDeepPartialEntity<DeferredWorkspaceOperationEntity>,
      ),
    );
    await this.enqueue(workspaceId);
  }

  async enqueue(workspaceId: string): Promise<void> {
    try {
      await this.messageQueueService.add<{ workspaceId: string }>(
        RUN_DEFERRED_WORKSPACE_OPERATIONS_JOB_NAME,
        { workspaceId },
        {
          deduplication: {
            id: `deferred-workspace-operations:${workspaceId}`,
            keepLastIfActive: true,
          },
          retryLimit: DEFERRED_WORKSPACE_OPERATION_MAX_ATTEMPTS - 1,
          backoff: DEFERRED_WORKSPACE_OPERATION_RETRY_BACKOFF,
          priority: DEFERRED_WORKSPACE_OPERATION_JOB_PRIORITY,
          workspaceId,
          isWorkspaceJob: true,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to enqueue deferred workspace operations for workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
