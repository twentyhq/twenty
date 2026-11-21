import { UseGuards } from '@nestjs/common';
import { Parent, ResolveField } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { CalendarChannelMetadataService } from 'src/engine/metadata-modules/calendar-channel/calendar-channel-metadata.service';
import { CalendarChannelDTO } from 'src/engine/metadata-modules/calendar-channel/dtos/calendar-channel.dto';
import { ConnectedAccountPublicDTO } from 'src/engine/metadata-modules/connected-account/dtos/connected-account-public.dto';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

@MetadataResolver(() => CalendarChannelDTO)
export class CalendarChannelFieldsResolver {
  constructor(
    private readonly calendarChannelMetadataService: CalendarChannelMetadataService,
  ) {}

  @ResolveField('connectedAccount', () => ConnectedAccountPublicDTO, {
    nullable: true,
  })
  @UseGuards(NoPermissionGuard)
  async connectedAccount(
    @Parent() calendarChannel: CalendarChannelDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId({ allowUndefined: true }) userWorkspaceId?: string,
  ): Promise<ConnectedAccountPublicDTO | null> {
    return this.calendarChannelMetadataService.findPublicConnectedAccountForCaller(
      {
        connectedAccountId: calendarChannel.connectedAccountId,
        workspaceId: workspace.id,
        userWorkspaceId,
      },
    );
  }
}
