import { ForbiddenException } from '@nestjs/common';

import { In } from 'typeorm';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageChannelVisibility } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export class CanAccessMessageThreadService {
  constructor(
    @InjectObjectMetadataRepository(WorkspaceMemberWorkspaceEntity)
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  public async canAccessMessageThread(
    userId: string,
    workspaceId: string,
    messageChannelMessageAssociations: MessageChannelMessageAssociationWorkspaceEntity[],
  ) {
    const messageChannelIds = messageChannelMessageAssociations.map(
      (association) => association.messageChannelId,
    );

    const currentWorkspaceMember =
      await this.workspaceMemberRepository.getByIdOrFail(userId, workspaceId);

    const connectedAccountRepository =
      await this.twentyORMManager.getRepository<ConnectedAccountWorkspaceEntity>(
        'connectedAccount',
      );

    const connectedAccounts = await connectedAccountRepository.find({
      select: {
        id: true,
      },
      where: [
        {
          messageChannels: {
            id: In(messageChannelIds),
            visibility: MessageChannelVisibility.SHARE_EVERYTHING,
          },
        },
        {
          messageChannels: {
            id: In(messageChannelIds),
          },
          accountOwnerId: currentWorkspaceMember.id,
        },
      ],
      take: 1,
    });

    if (connectedAccounts.length === 0) {
      throw new ForbiddenException();
    }
  }
}
