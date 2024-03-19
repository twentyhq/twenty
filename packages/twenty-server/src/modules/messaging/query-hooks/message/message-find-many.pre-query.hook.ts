import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { groupBy } from 'lodash';

import { WorkspacePreQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-pre-query-hook/interfaces/workspace-pre-query-hook.interface';
import { FindManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { MessageChannelMessageAssociationRepository } from 'src/modules/messaging/repositories/message-channel-message-association.repository';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { ConnectedAccountRepository } from 'src/modules/connected-account/repositories/connected-account.repository';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { MessageChannelObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel.object-metadata';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel-message-association.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';

@Injectable()
export class MessageFindManyPreQueryHook implements WorkspacePreQueryHook {
  constructor(
    @InjectObjectMetadataRepository(
      MessageChannelMessageAssociationObjectMetadata,
    )
    private readonly messageChannelMessageAssociationService: MessageChannelMessageAssociationRepository,
    @InjectObjectMetadataRepository(MessageChannelObjectMetadata)
    private readonly messageChannelService: MessageChannelRepository,
    @InjectObjectMetadataRepository(ConnectedAccountObjectMetadata)
    private readonly connectedAccountRepository: ConnectedAccountRepository,
    @InjectObjectMetadataRepository(WorkspaceMemberObjectMetadata)
    private readonly workspaceMemberService: WorkspaceMemberRepository,
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
      await this.workspaceMemberService.getByIdOrFail(userId, workspaceId);

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
