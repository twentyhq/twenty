import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MessageChannelType } from 'twenty-shared/types';
import { DataSource } from 'typeorm';

import { DynamicFieldResolver } from 'src/engine/api/common/common-dynamic-fields/decorators/dynamic-field-resolver.decorator';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { ChannelAssociationDynamicFieldResolver } from 'src/modules/connected-account/dynamic-fields/resolvers/channel-association.dynamic-field-resolver';
import { type ChannelAssociationChannelRow } from 'src/modules/connected-account/dynamic-fields/types/channel-association-channel-row.type';

@Injectable()
@DynamicFieldResolver()
export class MessageChannelMessageAssociationDynamicFieldResolver extends ChannelAssociationDynamicFieldResolver {
  readonly objectUniversalIdentifier =
    STANDARD_OBJECTS.messageChannelMessageAssociation.universalIdentifier;
  readonly channelIdColumnName = 'messageChannelId';

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    protected readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super();
  }

  protected async findChannelRows(
    workspaceId: string,
  ): Promise<ChannelAssociationChannelRow[]> {
    const messageChannels = await this.dataSource
      .getRepository(MessageChannelEntity)
      .find({
        where: { workspaceId },
        select: {
          id: true,
          handle: true,
          type: true,
          connectedAccount: { id: true, userWorkspaceId: true },
        },
        relations: { connectedAccount: true },
      });

    return messageChannels.map(({ id, handle, type, connectedAccount }) => ({
      id,
      handle,
      userWorkspaceId: connectedAccount?.userWorkspaceId ?? null,
      hasAccountOwner: type !== MessageChannelType.EMAIL_GROUP,
    }));
  }
}
