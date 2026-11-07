import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { appendCopySuffix, isDefined } from 'twenty-shared/utils';

import { ActorFromAuthContextService } from 'src/engine/core-modules/actor/services/actor-from-auth-context.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { PrincipalPermissionsService } from 'src/engine/permissions/principal-permissions.service';
import { RecordPermissionsService } from 'src/engine/permissions/record-permissions.service';
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
    private readonly principalPermissionsService: PrincipalPermissionsService,
    private readonly recordPermissionsService: RecordPermissionsService,
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

    // One transaction so a failed member insert never leaves a list copy without its members
    return this.workspaceOrmManager.executeTransactionInWorkspaceContext(
      (transactionScope) =>
        this.duplicateInTransaction({
          messageListId,
          authContext,
          transactionScope,
        }),
      authContext,
    );
  }

  // Repositories skip role checks on system objects, so the role is checked here
  private async assertCanReadAndUpdateDuplicatedObjects({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<void> {
    const [principals, { flatObjectMetadataMaps }] = await Promise.all([
      this.principalPermissionsService.resolveUserWorkspacePermissionsPrincipalsOrThrow(
        { workspaceId, userWorkspaceId },
      ),
      this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]),
    ]);

    const duplicatedObjects = DUPLICATED_OBJECT_UNIVERSAL_IDENTIFIERS.map(
      (objectUniversalIdentifier) =>
        flatObjectMetadataMaps.byUniversalIdentifier[objectUniversalIdentifier],
    );

    const canReadAndCreateDuplicatedObjects =
      duplicatedObjects.every(isDefined) &&
      (
        await Promise.all(
          duplicatedObjects.flatMap(({ id: objectMetadataId }) => [
            this.recordPermissionsService.canRoleAccessSomeRecords({
              operationType: 'read',
              principals,
              objectMetadataId,
            }),
            this.recordPermissionsService.canRoleAccessSomeRecords({
              operationType: 'create',
              principals,
              objectMetadataId,
            }),
          ]),
        )
      ).every((isGranted) => isGranted);

    if (!canReadAndCreateDuplicatedObjects) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }
  }

  private async duplicateInTransaction({
    messageListId,
    authContext,
    transactionScope,
  }: {
    messageListId: string;
    authContext: WorkspaceAuthContext;
    transactionScope: WorkspaceTransactionScope;
  }): Promise<DuplicatedMessageListDTO> {
    const messageListRepository =
      transactionScope.getRepository<MessageListWorkspaceEntity>('messageList');
    const messageListMemberRepository =
      transactionScope.getRepository<MessageListMemberWorkspaceEntity>(
        'messageListMember',
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
      createdAt: new Date(duplicatedMessageList.createdAt).toISOString(),
      updatedAt: new Date(duplicatedMessageList.updatedAt).toISOString(),
    };
  }
}
