import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { DataSource } from 'typeorm';

import { MetadataResolvedFieldResolver } from 'src/engine/api/common/common-metadata-resolved-fields/decorators/metadata-resolved-field-resolver.decorator';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { ChannelAssociationMetadataResolvedFieldResolver } from 'src/modules/connected-account/metadata-resolved-fields/resolvers/channel-association.metadata-resolved-field-resolver';
import { type ChannelAssociationChannelRow } from 'src/modules/connected-account/metadata-resolved-fields/types/channel-association-channel-row.type';

@Injectable()
@MetadataResolvedFieldResolver()
export class CalendarChannelEventAssociationMetadataResolvedFieldResolver extends ChannelAssociationMetadataResolvedFieldResolver {
  readonly objectUniversalIdentifier =
    STANDARD_OBJECTS.calendarChannelEventAssociation.universalIdentifier;
  readonly channelIdColumnName = 'calendarChannelId';

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    protected readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super();
  }

  protected async findChannelRows(
    workspaceId: string,
  ): Promise<ChannelAssociationChannelRow[]> {
    const calendarChannels = await this.dataSource
      .getRepository(CalendarChannelEntity)
      .find({
        where: { workspaceId },
        select: {
          id: true,
          handle: true,
          connectedAccount: { id: true, userWorkspaceId: true },
        },
        relations: { connectedAccount: true },
      });

    return calendarChannels.map(({ id, handle, connectedAccount }) => ({
      id,
      handle,
      userWorkspaceId: connectedAccount?.userWorkspaceId ?? null,
      hasAccountOwner: true,
    }));
  }
}
