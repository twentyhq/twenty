import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  FeatureFlagGuard,
  RequireFeatureFlag,
} from 'src/engine/guards/feature-flag.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CalendarChannelMetadataService } from 'src/engine/metadata-modules/calendar-channel/calendar-channel-metadata.service';
import { CalendarChannelDTO } from 'src/engine/metadata-modules/calendar-channel/dtos/calendar-channel.dto';
import { CreateCalendarChannelInput } from 'src/engine/metadata-modules/calendar-channel/dtos/create-calendar-channel.input';
import { UpdateCalendarChannelInput } from 'src/engine/metadata-modules/calendar-channel/dtos/update-calendar-channel.input';
import { CalendarChannelGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/calendar-channel/interceptors/calendar-channel-graphql-api-exception.interceptor';

@UseGuards(WorkspaceAuthGuard, FeatureFlagGuard)
@UseInterceptors(CalendarChannelGraphqlApiExceptionInterceptor)
@MetadataResolver(() => CalendarChannelDTO)
export class CalendarChannelResolver {
  constructor(
    private readonly calendarChannelMetadataService: CalendarChannelMetadataService,
  ) {}

  @Query(() => [CalendarChannelDTO])
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async calendarChannels(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('connectedAccountId', {
      type: () => UUIDScalarType,
      nullable: true,
    })
    connectedAccountId?: string,
  ): Promise<CalendarChannelDTO[]> {
    if (connectedAccountId) {
      return this.calendarChannelMetadataService.findByConnectedAccountId(
        connectedAccountId,
        workspace.id,
      );
    }

    return this.calendarChannelMetadataService.findAll(workspace.id);
  }

  @Query(() => CalendarChannelDTO, { nullable: true })
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async calendarChannel(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CalendarChannelDTO | null> {
    return this.calendarChannelMetadataService.findById(id, workspace.id);
  }

  @Mutation(() => CalendarChannelDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async createCalendarChannel(
    @Args('input') input: CreateCalendarChannelInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CalendarChannelDTO> {
    return this.calendarChannelMetadataService.create({
      ...input,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => CalendarChannelDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async updateCalendarChannel(
    @Args('input') input: UpdateCalendarChannelInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CalendarChannelDTO> {
    return this.calendarChannelMetadataService.update(
      input.id,
      workspace.id,
      input.update,
    );
  }

  @Mutation(() => CalendarChannelDTO)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.CONNECTED_ACCOUNTS))
  @RequireFeatureFlag(FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED)
  async deleteCalendarChannel(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CalendarChannelDTO> {
    return this.calendarChannelMetadataService.delete(id, workspace.id);
  }
}
