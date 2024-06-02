import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import groupBy from 'lodash.groupby';

import { WorkspacePreQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/interfaces/workspace-pre-query-hook.interface';
import { FindManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { MessageChannelMessageAssociationRepository } from 'src/modules/messaging/common/repositories/message-channel-message-association.repository';
import { MessageChannelRepository } from 'src/modules/messaging/common/repositories/message-channel.repository';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@Injectable()
export class MessageFindManyPreQueryHook implements WorkspacePreQueryHook {
  constructor(
    @InjectObjectMetadataRepository(
      MessageChannelMessageAssociationWorkspaceEntity,
    )
    private readonly messageChannelMessageAssociationService: MessageChannelMessageAssociationRepository,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelService: MessageChannelRepository,
    @InjectObjectMetadataRepository(ConnectedAccountWorkspaceEntity)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(WorkspaceMemberWorkspaceEntity)
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
  ) {}

  async execute(
    userId: string,
    workspaceId: string,
    payload: FindManyResolverArgs,
  ): Promise<void> {
    if (!payload?.filter?.messageThreadId?.eq) {
      throw new BadRequestException('messageThreadId filter is required');
    }

    const messageChannelMessageAssociations =
      await this.messageChannelMessageAssociationService.getByMessageThreadId(
        payload?.filter?.messageThreadId?.eq,
        workspaceId,
      );

    if (messageChannelMessageAssociations.length === 0) {
      throw new NotFoundException();
    }

    await this.canAccessMessageThread(
      userId,
      workspaceId,
      messageChannelMessageAssociations,
    );
  }

  private async canAccessMessageThread(
    userId: string,
    workspaceId: string,
    messageChannelMessageAssociations: any[],
  ) {
    const messageChannels = await this.messageChannelService.getByIds(
      messageChannelMessageAssociations.map(
        (association) => association.messageChannelId,
      ),
      workspaceId,
    );

    const messageChannelsGroupByVisibility = groupBy(
      messageChannels,
      (channel) => channel.visibility,
    );

    if (messageChannelsGroupByVisibility.share_everything) {
      return;
    }

    const currentWorkspaceMember =
      await this.workspaceMemberRepository.getByIdOrFail(userId, workspaceId);

    const messageChannelsConnectedAccounts =
      await this.connectedAccountRepository.getByIds(
        messageChannels.map((channel) => channel.connectedAccountId),
        workspaceId,
      );

    const messageChannelsWorkspaceMemberIds =
      messageChannelsConnectedAccounts.map(
        (connectedAccount) => connectedAccount.accountOwnerId,
      );

    if (messageChannelsWorkspaceMemberIds.includes(currentWorkspaceMember.id)) {
      return;
    }

    throw new ForbiddenException();
  }
}
