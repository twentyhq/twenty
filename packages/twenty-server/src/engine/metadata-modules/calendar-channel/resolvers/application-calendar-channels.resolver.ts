import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { CalendarChannelMetadataService } from 'src/engine/metadata-modules/calendar-channel/calendar-channel-metadata.service';
import { PublicCalendarChannelDTO } from 'src/engine/metadata-modules/calendar-channel/dtos/public-calendar-channel.dto';
import { CalendarChannelGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/calendar-channel/interceptors/calendar-channel-graphql-api-exception.interceptor';

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
@MetadataResolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
export class ApplicationCalendarChannelsResolver {
  constructor(
    private readonly calendarChannelMetadataService: CalendarChannelMetadataService,
  ) {}

  @Query(() => [PublicCalendarChannelDTO])
  async calendarChannels(
    @AuthWorkspace() workspace: FlatWorkspace,
  ): Promise<PublicCalendarChannelDTO[]> {
    return this.calendarChannelMetadataService.findAllPublic(workspace.id);
  }
}
