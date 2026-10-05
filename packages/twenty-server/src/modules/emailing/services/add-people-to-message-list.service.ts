import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { CommonFindManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-many-query-runner.service';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import {
  type CommonInput,
  type FindManyQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';
import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { ActorFromAuthContextService } from 'src/engine/core-modules/actor/services/actor-from-auth-context.service';
import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { CommonApiContextBuilderService } from 'src/engine/core-modules/record-crud/services/common-api-context-builder.service';
import { UserWorkspaceAuthContextService } from 'src/engine/core-modules/user-workspace/services/user-workspace-auth-context.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
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
    private readonly userRoleService: UserRoleService,
    private readonly actorFromAuthContextService: ActorFromAuthContextService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async countPeople({
    authContext,
    personFilter,
  }: {
    authContext: WorkspaceAuthContext;
    personFilter: Partial<ObjectRecordFilter>;
  }): Promise<number> {
    const { queryRunnerContext } =
      await this.commonApiContextBuilderService.build({
        authContext,
        objectName: 'person',
      });
    const { totalCount } = await this.findPeople(queryRunnerContext, {
      filter: personFilter,
      selectedFields: { totalCount: true, edges: { node: { id: true } } },
      first: 0,
    });

    return Number(totalCount);
  }

  async addPeopleToMessageList({
    workspaceId,
    userWorkspaceId,
    messageListId,
    personFilter,
  }: AddPeopleToMessageListJobData): Promise<void> {
    const authContext = await this.userWorkspaceAuthContextService.resolve({
      workspaceId,
      userWorkspaceId,
    });
    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId,
      userWorkspaceId,
    });
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
      const { records, pageInfo } = await this.findPeople(queryRunnerContext, {
        filter: personFilter,
        selectedFields: { edges: { node: { id: true } } },
        first: ADD_PEOPLE_TO_MESSAGE_LIST_PAGE_SIZE,
        after,
      });

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
              .getRepository<MessageListMemberWorkspaceEntity>(
                'messageListMember',
                { unionOf: [roleId] },
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
          MessageListExceptionCode.ADDING_PEOPLE_FAILED,
        );
      }

      after = pageInfo.endCursor;
    }

    throw new MessageListException(
      `More than ${ADD_PEOPLE_TO_MESSAGE_LIST_MAX_PERSON_COUNT} people match the selection`,
      MessageListExceptionCode.TOO_MANY_PEOPLE_TO_ADD,
    );
  }

  private async findPeople(
    queryRunnerContext: CommonBaseQueryRunnerContext,
    args: CommonInput<FindManyQueryArgs>,
  ) {
    const { results } = await withWorkspaceAuthContext(
      queryRunnerContext.authContext,
      () =>
        this.commonFindManyQueryRunnerService.execute(args, queryRunnerContext),
    );

    return results;
  }
}
