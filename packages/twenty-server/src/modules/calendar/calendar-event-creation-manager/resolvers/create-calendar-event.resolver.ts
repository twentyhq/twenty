import {
  ForbiddenException,
  Logger,
  UseFilters,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateCalendarEventOutputDTO } from 'src/modules/calendar/calendar-event-creation-manager/dtos/create-calendar-event-output.dto';
import { CreateCalendarEventInput } from 'src/modules/calendar/calendar-event-creation-manager/dtos/create-calendar-event.input';
import { CalendarEventComposerService } from 'src/modules/calendar/calendar-event-creation-manager/services/calendar-event-composer.service';
import { CreateCalendarEventService } from 'src/modules/calendar/calendar-event-creation-manager/services/create-calendar-event.service';

@MetadataResolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL),
)
export class CreateCalendarEventResolver {
  private readonly logger = new Logger(CreateCalendarEventResolver.name);

  constructor(
    private readonly calendarEventComposerService: CalendarEventComposerService,
    private readonly createCalendarEventService: CreateCalendarEventService,
  ) {}

  @Mutation(() => CreateCalendarEventOutputDTO)
  async createCalendarEvent(
    @Args('input') input: CreateCalendarEventInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<CreateCalendarEventOutputDTO> {
    try {
      const result =
        await this.calendarEventComposerService.composeCalendarEvent(
          {
            connectedAccountId: input.connectedAccountId,
            title: input.title,
            description: input.description,
            location: input.location,
            startsAt: input.startsAt,
            endsAt: input.endsAt,
            isFullDay: input.isFullDay,
            timeZone: input.timeZone,
            attendees: input.attendees,
            sendInvitations: input.sendInvitations,
            addConferencing: input.addConferencing,
          },
          getWorkspaceAuthContext(),
        );

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      const createdEvent =
        await this.createCalendarEventService.createComposedCalendarEvent(
          result.data,
        );

      const calendarEventId =
        await this.createCalendarEventService.persistCalendarEvent(
          createdEvent,
          result.data,
          workspace.id,
        );

      return {
        success: true,
        iCalUid: createdEvent.iCalUid || undefined,
        conferenceLink: createdEvent.conferenceLinkUrl || undefined,
        calendarEventId: calendarEventId ?? undefined,
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error(`Failed to create calendar event: ${error}`);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create calendar event',
      };
    }
  }
}
