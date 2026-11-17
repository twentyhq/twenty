import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Parent, Query, ResolveField } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { CalendarChannelMetadataService } from 'src/engine/metadata-modules/calendar-channel/calendar-channel-metadata.service';
import { PublicCalendarChannelDTO } from 'src/engine/metadata-modules/calendar-channel/dtos/public-calendar-channel.dto';
import { CalendarChannelGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/calendar-channel/interceptors/calendar-channel-graphql-api-exception.interceptor';
import { ConnectedAccountPublicDTO } from 'src/engine/metadata-modules/connected-account/dtos/connected-account-public.dto';

// Member-bound app tokens can be minted by any member, so only a server-side run may read other members' channels
@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: false,
      apiKey: false,
      oauthClient: false,
      application: { withUser: false, withoutUser: true },
    },
    requiredPermissionFlags: [PermissionFlagType.READ_PRIVATE_CHANNELS],
  }),
)
@UseInterceptors(CalendarChannelGraphqlApiExceptionInterceptor)
@MetadataResolver(() => PublicCalendarChannelDTO)
@UseFilters(AuthGraphqlApiExceptionFilter)
export class ApplicationCalendarChannelsResolver {
  constructor(
    private readonly calendarChannelMetadataService: CalendarChannelMetadataService,
  ) {}

  @Query(() => [PublicCalendarChannelDTO])
  async appCalendarChannels(
    @AuthWorkspace() workspace: FlatWorkspace,
  ): Promise<PublicCalendarChannelDTO[]> {
    return this.calendarChannelMetadataService.findAllPublic(workspace.id);
  }

  @ResolveField('connectedAccount', () => ConnectedAccountPublicDTO, {
    nullable: true,
  })
  async connectedAccount(
    @Parent() calendarChannel: PublicCalendarChannelDTO,
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthUserWorkspaceId({ allowUndefined: true }) userWorkspaceId?: string,
    @AuthApplication({ allowUndefined: true }) application?: FlatApplication,
  ): Promise<ConnectedAccountPublicDTO | null> {
    return this.calendarChannelMetadataService.findPublicConnectedAccountForCaller(
      {
        connectedAccountId: calendarChannel.connectedAccountId,
        workspaceId: workspace.id,
        userWorkspaceId,
        applicationId: application?.id,
      },
    );
  }
}
