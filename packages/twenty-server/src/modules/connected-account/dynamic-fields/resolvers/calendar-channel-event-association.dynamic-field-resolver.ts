import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { DataSource } from 'typeorm';

import { DynamicFieldResolver } from 'src/engine/api/common/common-dynamic-fields/decorators/dynamic-field-resolver.decorator';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { ChannelAssociationDynamicFieldResolver } from 'src/modules/connected-account/dynamic-fields/resolvers/channel-association.dynamic-field-resolver';
import { type ChannelAssociationChannelRow } from 'src/modules/connected-account/dynamic-fields/types/channel-association-channel-row.type';

@Injectable()
@DynamicFieldResolver()
export class CalendarChannelEventAssociationDynamicFieldResolver extends ChannelAssociationDynamicFieldResolver {
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
