import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { appendCopySuffix, isDefined } from 'twenty-shared/utils';

import { ActorFromAuthContextService } from 'src/engine/core-modules/actor/services/actor-from-auth-context.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { DuplicatedMessageListDTO } from 'src/modules/emailing/dtos/duplicated-message-list.dto';
import {
  MessageListException,
  MessageListExceptionCode,
} from 'src/modules/emailing/exceptions/message-list.exception';
import { type MessageListMemberWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-list-member.workspace-entity';
import { type MessageListWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-list.workspace-entity';

const DUPLICATED_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.messageList.universalIdentifier,
  STANDARD_OBJECTS.messageListMember.universalIdentifier,
];

@Injectable()
export class MessageListDuplicationService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly userRoleService: UserRoleService,
    private readonly permissionsService: PermissionsService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly actorFromAuthContextService: ActorFromAuthContextService,
  ) {}

  async duplicateMessageList({
    messageListId,
    userWorkspaceId,
    authContext,
  }: {
    messageListId: string;
    userWorkspaceId: string;
    authContext: WorkspaceAuthContext;
  }): Promise<DuplicatedMessageListDTO> {
    const workspaceId = authContext.workspace.id;

    await this.assertCanReadAndUpdateDuplicatedObjects({
      workspaceId,
      userWorkspaceId,
    });

    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId,
      userWorkspaceId,
    });

    // One transaction so a failed member insert never leaves a list copy
    // without its members.
    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager.runInWorkspaceTransaction((transactionScope) =>
          this.duplicateInTransaction({
            messageListId,
            roleId,
            authContext,
            transactionScope,
          }),
        ),
      authContext,
    );
  }

  // messageList and messageListMember are system objects, for which the
  // repositories skip role permission checks, so the role is checked here.
  private async assertCanReadAndUpdateDuplicatedObjects({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<void> {
    const [{ objectsPermissions }, { flatObjectMetadataMaps }] =
      await Promise.all([
        this.permissionsService.getUserWorkspacePermissions({
          workspaceId,
          userWorkspaceId,
        }),
        this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatObjectMetadataMaps',
        ]),
      ]);

    for (const objectUniversalIdentifier of DUPLICATED_OBJECT_UNIVERSAL_IDENTIFIERS) {
      const objectMetadata =
        flatObjectMetadataMaps.byUniversalIdentifier[objectUniversalIdentifier];
      const objectPermissions = isDefined(objectMetadata)
        ? objectsPermissions[objectMetadata.id]
        : undefined;

      if (
        !objectPermissions?.canReadObjectRecords ||
        !objectPermissions.canUpdateObjectRecords
      ) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }
    }
  }

  private async duplicateInTransaction({
    messageListId,
    roleId,
    authContext,
    transactionScope,
  }: {
    messageListId: string;
    roleId: string;
    authContext: WorkspaceAuthContext;
    transactionScope: WorkspaceTransactionScope;
  }): Promise<DuplicatedMessageListDTO> {
    const messageListRepository =
      transactionScope.getRepository<MessageListWorkspaceEntity>(
        'messageList',
        { unionOf: [roleId] },
      );
    const messageListMemberRepository =
      transactionScope.getRepository<MessageListMemberWorkspaceEntity>(
        'messageListMember',
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
  }
}
