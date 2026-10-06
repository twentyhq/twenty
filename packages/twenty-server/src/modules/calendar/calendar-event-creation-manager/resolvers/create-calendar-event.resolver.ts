import {
  ForbiddenException,
  Logger,
  UseFilters,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Args, Context, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { type I18nContext } from 'src/engine/core-modules/i18n/types/i18n-context.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { CreateCalendarEventOutputDTO } from 'src/modules/calendar/calendar-event-creation-manager/dtos/create-calendar-event-output.dto';
import { CreateCalendarEventInput } from 'src/modules/calendar/calendar-event-creation-manager/dtos/create-calendar-event.input';
import { CalendarEventComposerService } from 'src/modules/calendar/calendar-event-creation-manager/services/calendar-event-composer.service';
import { CreateCalendarEventService } from 'src/modules/calendar/calendar-event-creation-manager/services/create-calendar-event.service';
import { CustomException } from 'src/utils/custom-exception';

@MetadataResolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter)
@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  }),
  SettingsPermissionGuard(PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL),
)
export class CreateCalendarEventResolver {
  private readonly logger = new Logger(CreateCalendarEventResolver.name);

  constructor(
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
    private readonly calendarEventComposerService: CalendarEventComposerService,
    private readonly createCalendarEventService: CreateCalendarEventService,
    private readonly i18nService: I18nService,
  ) {}

  @Mutation(() => CreateCalendarEventOutputDTO)
  async createCalendarEvent(
    @Args('input') input: CreateCalendarEventInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @Context() context: I18nContext,
  ): Promise<CreateCalendarEventOutputDTO> {
    try {
      await this.connectedAccountMetadataService.verifyUsableByCaller({
        id: input.connectedAccountId,
        userWorkspaceId,
        workspaceId: workspace.id,
      });

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
          workspace.id,
        );

      if (!result.success) {
        return {
          success: false,
          error: this.i18nService
            .getI18nInstance(context.req.locale)
            ._(result.error),
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

      if (error instanceof CustomException) {
        return {
          success: false,
          error: this.i18nService
            .getI18nInstance(context.req.locale)
            ._(error.userFriendlyMessage),
        };
      }

      // Without an error the client shows its own translated fallback
      return { success: false };
    }
  }
}
