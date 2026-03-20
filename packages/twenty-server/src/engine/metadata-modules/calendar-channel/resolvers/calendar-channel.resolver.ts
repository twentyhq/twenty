import { ForbiddenException, UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CalendarChannelMetadataService } from 'src/engine/metadata-modules/calendar-channel/calendar-channel-metadata.service';
import { CalendarChannelDTO } from 'src/engine/metadata-modules/calendar-channel/dtos/calendar-channel.dto';
import { UpdateCalendarChannelInput } from 'src/engine/metadata-modules/calendar-channel/dtos/update-calendar-channel.input';
import { CalendarChannelGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/calendar-channel/interceptors/calendar-channel-graphql-api-exception.interceptor';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';

@UseGuards(WorkspaceAuthGuard, FeatureFlagGuard)
@UseInterceptors(CalendarChannelGraphqlApiExceptionInterceptor)
@MetadataResolver(() => CalendarChannelDTO)
export class CalendarChannelResolver {
  constructor(
    private readonly calendarChannelMetadataService: CalendarChannelMetadataService,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
  ) {}

  @Query(() => [CalendarChannelDTO])
  @UseGuards(NoPermissionGuard)
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async myCalendarChannels(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
    @Args('connectedAccountId', {
      type: () => UUIDScalarType,
      nullable: true,
    })
    connectedAccountId?: string,
  ): Promise<CalendarChannelDTO[]> {
    if (!isDefined(userWorkspaceId)) {
      throw new ForbiddenException(
        'User-scoped queries require a user context (API keys are not supported)',
      );
    }

    if (connectedAccountId) {
      await this.connectedAccountMetadataService.verifyOwnership(
        connectedAccountId,
        userWorkspaceId,
        workspace.id,
      );

      return this.calendarChannelMetadataService.findByConnectedAccountId(
        connectedAccountId,
        workspace.id,
      );
    }

    const userAccountIds =
      await this.connectedAccountMetadataService.getUserConnectedAccountIds(
        userWorkspaceId,
        workspace.id,
      );

    return this.calendarChannelMetadataService.findByConnectedAccountIds(
      userAccountIds,
      workspace.id,
    );
  }

  @Mutation(() => CalendarChannelDTO)
  @UseGuards(NoPermissionGuard)
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async updateCalendarChannel(
    @Args('input') input: UpdateCalendarChannelInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string | undefined,
  ): Promise<CalendarChannelDTO> {
    if (!isDefined(userWorkspaceId)) {
      throw new ForbiddenException(
        'User-scoped mutations require a user context (API keys are not supported)',
      );
    }

    await this.calendarChannelMetadataService.verifyOwnership(
      input.id,
      userWorkspaceId,
      workspace.id,
    );

    return this.calendarChannelMetadataService.update(
      input.id,
      workspace.id,
      input.update,
    );
  }
}
