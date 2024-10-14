import { ForbiddenException } from '@nestjs/common';

import groupBy from 'lodash.groupby';
import { Any } from 'typeorm';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
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
    messageChannelMessageAssociations: any[],
  ) {
    const messageChannelRepository =
      await this.twentyORMManager.getRepository<MessageChannelWorkspaceEntity>(
        'messageChannel',
      );
    const messageChannels = await messageChannelRepository.find({
      select: ['id', 'visibility'],
      where: {
        id: Any(
          messageChannelMessageAssociations.map(
            (association) => association.messageChannelId,
          ),
        ),
      },
    });

    const messageChannelsGroupByVisibility = groupBy(
      messageChannels,
      (channel) => channel.visibility,
    );

    if (messageChannelsGroupByVisibility.SHARE_EVERYTHING) {
      return;
    }

    const currentWorkspaceMember =
      await this.workspaceMemberRepository.getByIdOrFail(userId, workspaceId);

    const connectedAccountRepository =
      await this.twentyORMManager.getRepository<ConnectedAccountWorkspaceEntity>(
        'connectedAccount',
      );

    const connectedAccounts = await connectedAccountRepository.find({
      select: ['id'],
      where: {
        messageChannels: Any(messageChannels.map((channel) => channel.id)),
        accountOwnerId: currentWorkspaceMember.id,
      },
    });

    if (connectedAccounts.length > 0) {
      return;
    }

    throw new ForbiddenException();
  }
}
