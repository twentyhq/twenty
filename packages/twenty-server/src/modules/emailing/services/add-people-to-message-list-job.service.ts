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
import { getQueueJobIdPrefix } from 'src/engine/core-modules/message-queue/utils/get-queue-job-id-prefix.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { ADD_PEOPLE_TO_MESSAGE_LIST_JOB_START_DELAY_MS } from 'src/modules/emailing/constants/add-people-to-message-list-job-start-delay-ms.constant';
import { ADD_PEOPLE_TO_MESSAGE_LIST_MAX_PERSON_COUNT } from 'src/modules/emailing/constants/add-people-to-message-list-max-person-count.constant';
import {
  MessageListException,
  MessageListExceptionCode,
} from 'src/modules/emailing/exceptions/message-list.exception';
import { AddPeopleToMessageListJob } from 'src/modules/emailing/jobs/add-people-to-message-list.job';
import { AddPeopleToMessageListService } from 'src/modules/emailing/services/add-people-to-message-list.service';
import { type MessageListWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-list.workspace-entity';
import { type AddPeopleToMessageListJobData } from 'src/modules/emailing/types/add-people-to-message-list-job-data.type';
import { buildAddPeopleToMessageListJobId } from 'src/modules/emailing/utils/build-add-people-to-message-list-job-id.util';

@Injectable()
export class AddPeopleToMessageListJobService {
  constructor(
    private readonly addPeopleToMessageListService: AddPeopleToMessageListService,
    private readonly userRoleService: UserRoleService,
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

    const workspaceId = authContext.workspace.id;
    const userWorkspaceId = authContext.userWorkspaceId;

    await this.assertMessageListExists({
      messageListId,
      workspaceId,
      userWorkspaceId,
      authContext,
    });

    const personCount = await this.addPeopleToMessageListService.countPeople({
      authContext,
      personFilter,
    });

    if (personCount > ADD_PEOPLE_TO_MESSAGE_LIST_MAX_PERSON_COUNT) {
      throw new MessageListException(
        `Cannot add ${personCount} people to a list at once`,
        MessageListExceptionCode.TOO_MANY_PEOPLE_TO_ADD,
      );
    }

    return this.cacheLockService.withLock(
      () =>
        this.enqueueAddPeopleToMessageListJob({
          workspaceId,
          userWorkspaceId,
          messageListId,
          personFilter,
        }),
      `add-people-to-message-list-job:${workspaceId}:${messageListId}`,
    );
  }

  async findAddPeopleToMessageListJobStatus({
    messageListId,
    workspaceId,
  }: {
    messageListId: string;
    workspaceId: string;
  }): Promise<JobStatusDTO | null> {
    const jobId = await this.findInFlightJobId(
      buildAddPeopleToMessageListJobId({ workspaceId, messageListId }),
    );

    if (!isDefined(jobId)) {
      return null;
    }

    const job = (await this.campaignQueueService.getJobs([jobId]))[jobId];

    return isDefined(job) ? buildJobStatus({ jobId, job }) : null;
  }

  private async assertMessageListExists({
    messageListId,
    workspaceId,
    userWorkspaceId,
    authContext,
  }: {
    messageListId: string;
    workspaceId: string;
    userWorkspaceId: string;
    authContext: WorkspaceAuthContext;
  }): Promise<void> {
    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId,
      userWorkspaceId,
    });
    const messageList =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepository<MessageListWorkspaceEntity>('messageList', {
              unionOf: [roleId],
            })
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

    if (isDefined(await this.findInFlightJobId(jobIdPrefix))) {
      throw new MessageListException(
        `People are already being added to message list ${data.messageListId}`,
        MessageListExceptionCode.ADDING_PEOPLE_IN_PROGRESS,
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
        MessageListExceptionCode.ADDING_PEOPLE_FAILED,
      );
    }

    return { jobId };
  }

  private async findInFlightJobId(
    jobIdPrefix: string,
  ): Promise<string | undefined> {
    const inFlightJobs = await this.campaignQueueService.getInFlightJobs();

    return inFlightJobs
      .map((job) => job.id)
      .filter(isDefined)
      .find((jobId) => getQueueJobIdPrefix(jobId) === jobIdPrefix);
  }
}
