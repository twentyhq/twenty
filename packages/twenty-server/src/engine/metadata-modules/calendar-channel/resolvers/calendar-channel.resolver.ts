import { UseGuards, UseInterceptors, UseFilters } from '@nestjs/common';
import { Args, Mutation, Parent, Query, ResolveField } from '@nestjs/graphql';

import { CalendarChannelSyncStage } from 'twenty-shared/types';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AllowSuspendedWorkspace } from 'src/engine/decorators/auth/allow-suspended-workspace.decorator';
import { CalendarChannelMetadataService } from 'src/engine/metadata-modules/calendar-channel/calendar-channel-metadata.service';
import { CalendarChannelDTO } from 'src/engine/metadata-modules/calendar-channel/dtos/calendar-channel.dto';
import { UpdateCalendarChannelInput } from 'src/engine/metadata-modules/calendar-channel/dtos/update-calendar-channel.input';
import { ConnectedAccountPublicDTO } from 'src/engine/metadata-modules/connected-account/dtos/connected-account-public.dto';
import { CalendarChannelGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/calendar-channel/interceptors/calendar-channel-graphql-api-exception.interceptor';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { CalendarChannelSyncStatusService } from 'src/modules/calendar/common/services/calendar-channel-sync-status.service';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { ROLES_READING_ALL_RECORDS_ACCESS_POLICY } from 'src/engine/permissions/channel-visibility/constants/roles-reading-all-records-access-policy.constant';
import { RolesReadingAllRecordsDTO } from 'src/engine/permissions/channel-visibility/dtos/roles-reading-all-records.dto';
import { ChannelVisibilityRoleWideAccessReadService } from 'src/engine/permissions/channel-visibility/services/channel-visibility-role-wide-access-read.service';

const CALENDAR_CHANNEL_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  },
  requiredPermissionFlags: [],
};

@UseInterceptors(CalendarChannelGraphqlApiExceptionInterceptor)
@MetadataResolver(() => CalendarChannelDTO)
@UseFilters(AuthGraphqlApiExceptionFilter)
export class CalendarChannelResolver {
  constructor(
    private readonly calendarChannelMetadataService: CalendarChannelMetadataService,
    private readonly calendarChannelSyncStatusService: CalendarChannelSyncStatusService,
    private readonly channelVisibilityRoleWideAccessReadService: ChannelVisibilityRoleWideAccessReadService,
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

  @Query(() => [CalendarChannelDTO])
  @UseGuards(AccessPolicyGuard(CALENDAR_CHANNEL_ACCESS_POLICY))
  @AllowSuspendedWorkspace()
  async myCalendarChannels(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Args('connectedAccountId', {
      type: () => UUIDScalarType,
      nullable: true,
    })
    connectedAccountId?: string,
  ): Promise<CalendarChannelDTO[]> {
    if (connectedAccountId) {
      return this.calendarChannelMetadataService.findByConnectedAccountIdForUser(
        {
          connectedAccountId,
          userWorkspaceId,
          workspaceId: workspace.id,
        },
      );
    }

    return this.calendarChannelMetadataService.findByUserWorkspaceId({
      userWorkspaceId,
      workspaceId: workspace.id,
    });
  }

  @Query(() => RolesReadingAllRecordsDTO)
  @UseGuards(AccessPolicyGuard(ROLES_READING_ALL_RECORDS_ACCESS_POLICY))
  async rolesReadingAllCalendarEvents(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<RolesReadingAllRecordsDTO> {
    return this.channelVisibilityRoleWideAccessReadService.findRolesReadingAllRecords(
      {
        workspaceId: workspace.id,
        objectUniversalIdentifier:
          STANDARD_OBJECTS.calendarEvent.universalIdentifier,
      },
    );
  }

  @Mutation(() => CalendarChannelDTO)
  @UseGuards(AccessPolicyGuard(CALENDAR_CHANNEL_ACCESS_POLICY))
  async updateCalendarChannel(
    @Args('input') input: UpdateCalendarChannelInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<CalendarChannelDTO> {
    const calendarChannel =
      await this.calendarChannelMetadataService.verifyOwnership({
        id: input.id,
        userWorkspaceId,
        workspaceId: workspace.id,
      });

    const updatedCalendarChannel =
      await this.calendarChannelMetadataService.update({
        id: input.id,
        workspaceId: workspace.id,
        data: input.update,
      });

    const hasStartedSyncing =
      calendarChannel.syncStage !==
      CalendarChannelSyncStage.PENDING_CONFIGURATION;

    const hasExcludePrivateEventsChanged =
      isDefined(input.update.excludePrivateEvents) &&
      input.update.excludePrivateEvents !==
        calendarChannel.excludePrivateEvents;

    if (hasStartedSyncing && hasExcludePrivateEventsChanged) {
      await this.calendarChannelSyncStatusService.resetAndMarkAsCalendarEventListFetchPending(
        [calendarChannel.id],
        workspace.id,
      );
    }

    return updatedCalendarChannel;
  }
}
