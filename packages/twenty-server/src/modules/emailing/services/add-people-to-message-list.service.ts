import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { CommonFindManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-many-query-runner.service';
import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { ActorFromAuthContextService } from 'src/engine/core-modules/actor/services/actor-from-auth-context.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { UserWorkspaceAuthContextService } from 'src/engine/core-modules/user-workspace/services/user-workspace-auth-context.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { ADD_PEOPLE_TO_MESSAGE_LIST_MAX_PERSON_COUNT } from 'src/modules/emailing/constants/add-people-to-message-list-max-person-count.constant';
import { ADD_PEOPLE_TO_MESSAGE_LIST_PAGE_SIZE } from 'src/modules/emailing/constants/add-people-to-message-list-page-size.constant';
import {
  MessageListException,
  MessageListExceptionCode,
} from 'src/modules/emailing/exceptions/message-list.exception';
import { type MessageListMemberWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-list-member.workspace-entity';
import { type AddPeopleToMessageListJobData } from 'src/modules/emailing/types/add-people-to-message-list-job-data.type';

@Injectable()
export class AddPeopleToMessageListService {
  constructor(
    private readonly commonApiContextBuilderService: CommonApiContextBuilderService,
    private readonly commonFindManyQueryRunnerService: CommonFindManyQueryRunnerService,
    private readonly userWorkspaceAuthContextService: UserWorkspaceAuthContextService,
    private readonly actorFromAuthContextService: ActorFromAuthContextService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async assertPersonCountWithinLimit({
    authContext,
    personFilter,
  }: {
    authContext: WorkspaceAuthContext;
    personFilter: Partial<ObjectRecordFilter>;
  }): Promise<void> {
    const { queryRunnerContext } =
      await this.commonApiContextBuilderService.build({
        authContext,
        objectName: 'person',
      });
    const {
      results: { totalCount },
    } = await this.commonFindManyQueryRunnerService.execute(
      {
        filter: personFilter,
        selectedFields: { totalCount: true, edges: { node: { id: true } } },
        first: 0,
      },
      queryRunnerContext,
    );

    if (!isDefined(totalCount)) {
      throw new MessageListException(
        'People count is unavailable',
        MessageListExceptionCode.MESSAGE_LIST_ADD_PEOPLE_FAILED,
      );
    }

    if (Number(totalCount) > ADD_PEOPLE_TO_MESSAGE_LIST_MAX_PERSON_COUNT) {
      throw new MessageListException(
        `Cannot add ${totalCount} people to a list at once`,
        MessageListExceptionCode.MESSAGE_LIST_TOO_MANY_PEOPLE_TO_ADD,
      );
    }
  }

  async addPeopleToMessageList({
    workspaceId,
    userWorkspaceId,
    applicationId,
    messageListId,
    personFilter,
  }: AddPeopleToMessageListJobData): Promise<void> {
    const authContext = await this.userWorkspaceAuthContextService.resolve({
      workspaceId,
      userWorkspaceId,
      applicationId,
    });

    await this.assertPersonCountWithinLimit({ authContext, personFilter });

    const { queryRunnerContext } =
      await this.commonApiContextBuilderService.build({
        authContext,
        objectName: 'person',
      });
    const maxPageCount = Math.ceil(
      ADD_PEOPLE_TO_MESSAGE_LIST_MAX_PERSON_COUNT /
        ADD_PEOPLE_TO_MESSAGE_LIST_PAGE_SIZE,
    );
    let after: string | undefined;

    for (let pageIndex = 0; pageIndex < maxPageCount; pageIndex++) {
      const {
        results: { records, pageInfo },
      } = await this.commonFindManyQueryRunnerService.execute(
        {
          filter: personFilter,
          selectedFields: { edges: { node: { id: true } } },
          first: ADD_PEOPLE_TO_MESSAGE_LIST_PAGE_SIZE,
          after,
        },
        queryRunnerContext,
      );

      if (records.length > 0) {
        const members =
          await this.actorFromAuthContextService.injectActorFieldsOnCreate({
            records: records.map((person) => ({
              listId: messageListId,
              personId: person.id,
            })),
            objectMetadataNameSingular: 'messageListMember',
            authContext,
          });

        await this.workspaceOrmManager.executeInWorkspaceContext(
          () =>
            this.workspaceOrmManager
              .getRepositoryWithContextPermissions<MessageListMemberWorkspaceEntity>(
                'messageListMember',
              )
              .insert(members, { onConflictDoNothing: true }),
          authContext,
        );
      }

      if (!pageInfo.hasNextPage) {
        return;
      }

      if (!isDefined(pageInfo.endCursor) || pageInfo.endCursor === after) {
        throw new MessageListException(
          'People pagination did not advance',
          MessageListExceptionCode.MESSAGE_LIST_ADD_PEOPLE_FAILED,
        );
      }

      after = pageInfo.endCursor;
    }

    throw new MessageListException(
      `More than ${ADD_PEOPLE_TO_MESSAGE_LIST_MAX_PERSON_COUNT} people match the selection`,
      MessageListExceptionCode.MESSAGE_LIST_TOO_MANY_PEOPLE_TO_ADD,
    );
  }
}
