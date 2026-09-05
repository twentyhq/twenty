import { Injectable } from '@nestjs/common';

import { appendCopySuffix, isDefined } from 'twenty-shared/utils';

import { ActorFromAuthContextService } from 'src/engine/core-modules/actor/services/actor-from-auth-context.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { DuplicatedMessageListDTO } from 'src/modules/emailing/dtos/duplicated-message-list.dto';
import {
  MessageListException,
  MessageListExceptionCode,
} from 'src/modules/emailing/exceptions/message-list.exception';
import { MessageListMemberWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-list-member.workspace-entity';
import { MessageListWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-list.workspace-entity';

@Injectable()
export class MessageListDuplicationService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly userRoleService: UserRoleService,
    private readonly actorFromAuthContextService: ActorFromAuthContextService,
  ) {}

  // Runs with the caller's role so the copy obeys the same object permissions
  // as creating the list and its memberships by hand.
  async duplicateMessageList({
    messageListId,
    userWorkspaceId,
    authContext,
  }: {
    messageListId: string;
    userWorkspaceId: string;
    authContext: WorkspaceAuthContext;
  }): Promise<DuplicatedMessageListDTO> {
    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId: authContext.workspace.id,
      userWorkspaceId,
    });

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageListRepository =
        this.workspaceOrmManager.getRepository<MessageListWorkspaceEntity>(
          MessageListWorkspaceEntity,
          { unionOf: [roleId] },
        );
      const messageListMemberRepository =
        this.workspaceOrmManager.getRepository<MessageListMemberWorkspaceEntity>(
          MessageListMemberWorkspaceEntity,
          { unionOf: [roleId] },
        );

      const originalMessageList = await messageListRepository.findOne({
        where: { id: messageListId },
      });

      if (!isDefined(originalMessageList)) {
        throw new MessageListException(
          `Message list with ID "${messageListId}" not found`,
          MessageListExceptionCode.MESSAGE_LIST_NOT_FOUND,
        );
      }

      const originalMembers = await messageListMemberRepository.find({
        where: { listId: messageListId },
      });

      const [messageListWithActor] =
        await this.actorFromAuthContextService.injectActorFieldsOnCreate({
          records: [
            {
              name: appendCopySuffix(originalMessageList.name ?? ''),
              description: originalMessageList.description,
              position: originalMessageList.position,
            },
          ],
          objectMetadataNameSingular: 'messageList',
          authContext,
        });

      const insertResult =
        await messageListRepository.insert(messageListWithActor);
      const duplicatedMessageListId: string = insertResult.identifiers[0].id;

      if (originalMembers.length > 0) {
        const membersWithActor =
          await this.actorFromAuthContextService.injectActorFieldsOnCreate({
            records: originalMembers.map((member) => ({
              listId: duplicatedMessageListId,
              personId: member.personId,
              position: member.position,
            })),
            objectMetadataNameSingular: 'messageListMember',
            authContext,
          });

        await messageListMemberRepository.insert(membersWithActor);
      }

      const duplicatedMessageList = await messageListRepository.findOne({
        where: { id: duplicatedMessageListId },
      });

      if (!isDefined(duplicatedMessageList)) {
        throw new MessageListException(
          'Failed to retrieve the duplicated message list',
          MessageListExceptionCode.MESSAGE_LIST_DUPLICATION_FAILED,
        );
      }

      return {
        id: duplicatedMessageList.id,
        name: duplicatedMessageList.name,
        description: duplicatedMessageList.description,
        position: duplicatedMessageList.position,
        memberCount: originalMembers.length,
        createdAt: duplicatedMessageList.createdAt,
        updatedAt: duplicatedMessageList.updatedAt,
      };
    }, authContext);
  }
}
