import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { type JobStatusDTO } from 'src/engine/core-modules/message-queue/dtos/job-status.dto';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { buildJobStatus } from 'src/engine/core-modules/message-queue/utils/build-job-status.util';
import { findInFlightQueueJobIdByPrefix } from 'src/engine/core-modules/message-queue/utils/find-in-flight-queue-job-id-by-prefix.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { ADD_PEOPLE_TO_MESSAGE_LIST_JOB_START_DELAY_MS } from 'src/modules/emailing/constants/add-people-to-message-list-job-start-delay-ms.constant';
import {
  MessageListException,
  MessageListExceptionCode,
} from 'src/modules/emailing/exceptions/message-list.exception';
import { AddPeopleToMessageListJob } from 'src/modules/emailing/jobs/add-people-to-message-list.job';
import { AddPeopleToMessageListService } from 'src/modules/emailing/services/add-people-to-message-list.service';
import { type MessageListWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-list.workspace-entity';
import { type AddPeopleToMessageListJobData } from 'src/modules/emailing/types/add-people-to-message-list-job-data.type';
import { buildAddPeopleToMessageListJobId } from 'src/modules/emailing/utils/build-add-people-to-message-list-job-id.util';
import { buildAddPeopleToMessageListLockKey } from 'src/modules/emailing/utils/build-add-people-to-message-list-lock-key.util';

@Injectable()
export class AddPeopleToMessageListJobService {
  constructor(
    private readonly addPeopleToMessageListService: AddPeopleToMessageListService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly cacheLockService: CacheLockService,
    @InjectMessageQueue(MessageQueue.campaignQueue)
    private readonly campaignQueueService: MessageQueueService,
  ) {}

  async triggerAddPeopleToMessageListJob({
    messageListId,
    personFilter,
    authContext,
  }: {
    messageListId: string;
    personFilter: Partial<ObjectRecordFilter>;
    authContext: WorkspaceAuthContext;
  }): Promise<{ jobId: string }> {
    if (!isUserAuthContext(authContext)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }

    await this.assertMessageListExists({ messageListId, authContext });
    await this.addPeopleToMessageListService.assertPersonCountWithinLimit({
      authContext,
      personFilter,
    });

    const workspaceId = authContext.workspace.id;

    return this.cacheLockService.withLock(
      () =>
        this.enqueueAddPeopleToMessageListJob({
          workspaceId,
          userWorkspaceId: authContext.userWorkspaceId,
          applicationId: authContext.application?.id,
          messageListId,
          personFilter,
        }),
      buildAddPeopleToMessageListLockKey({ workspaceId, messageListId }),
    );
  }

  async findAddPeopleToMessageListJobStatus({
    messageListId,
    authContext,
  }: {
    messageListId: string;
    authContext: WorkspaceAuthContext;
  }): Promise<JobStatusDTO | null> {
    await this.assertMessageListExists({ messageListId, authContext });

    const jobId = findInFlightQueueJobIdByPrefix({
      inFlightJobs: await this.campaignQueueService.getInFlightJobs(),
      jobIdPrefix: buildAddPeopleToMessageListJobId({
        workspaceId: authContext.workspace.id,
        messageListId,
      }),
    });

    if (!isDefined(jobId)) {
      return null;
    }

    const job = (await this.campaignQueueService.getJobs([jobId]))[jobId];

    return isDefined(job) ? buildJobStatus({ jobId, job }) : null;
  }

  private async assertMessageListExists({
    messageListId,
    authContext,
  }: {
    messageListId: string;
    authContext: WorkspaceAuthContext;
  }): Promise<void> {
    const messageList =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepositoryWithContextPermissions<MessageListWorkspaceEntity>(
              'messageList',
            )
            .findOne({ where: { id: messageListId } }),
        authContext,
      );

    if (!isDefined(messageList)) {
      throw new MessageListException(
        `Message list with ID "${messageListId}" not found`,
        MessageListExceptionCode.MESSAGE_LIST_NOT_FOUND,
      );
    }
  }

  private async enqueueAddPeopleToMessageListJob(
    data: AddPeopleToMessageListJobData,
  ): Promise<{ jobId: string }> {
    const jobIdPrefix = buildAddPeopleToMessageListJobId(data);
    const inFlightJobId = findInFlightQueueJobIdByPrefix({
      inFlightJobs: await this.campaignQueueService.getInFlightJobs(),
      jobIdPrefix,
    });

    if (isDefined(inFlightJobId)) {
      throw new MessageListException(
        `People are already being added to message list ${data.messageListId}`,
        MessageListExceptionCode.MESSAGE_LIST_ADD_PEOPLE_IN_PROGRESS,
      );
    }

    const jobId =
      await this.campaignQueueService.add<AddPeopleToMessageListJobData>(
        AddPeopleToMessageListJob.name,
        data,
        {
          id: jobIdPrefix,
          delay: ADD_PEOPLE_TO_MESSAGE_LIST_JOB_START_DELAY_MS,
          broadcastTo: { workspaceId: data.workspaceId },
        },
      );

    if (!isDefined(jobId)) {
      throw new MessageListException(
        `Could not queue adding people to message list ${data.messageListId}`,
        MessageListExceptionCode.MESSAGE_LIST_ADD_PEOPLE_FAILED,
      );
    }

    return { jobId };
  }
}
