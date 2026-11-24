import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MessageChannelType } from 'twenty-shared/types';
import { DataSource } from 'typeorm';

import { MetadataResolvedFieldResolver } from 'src/engine/api/common/common-metadata-resolved-fields/decorators/metadata-resolved-field-resolver.decorator';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { ChannelAssociationMetadataResolvedFieldResolver } from 'src/modules/connected-account/metadata-resolved-fields/resolvers/channel-association.metadata-resolved-field-resolver';
import { type ChannelAssociationChannelRow } from 'src/modules/connected-account/metadata-resolved-fields/types/channel-association-channel-row.type';

@Injectable()
@MetadataResolvedFieldResolver()
export class MessageChannelMessageAssociationMetadataResolvedFieldResolver extends ChannelAssociationMetadataResolvedFieldResolver {
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
