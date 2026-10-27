import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { Request, Response } from 'express';
import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { MemberEventStreamInput } from 'src/engine/metadata-modules/event-metadata/dtos/member-event-stream.input';
import {
  EventMetadataException,
  EventMetadataExceptionCode,
} from 'src/engine/metadata-modules/event-metadata/event-metadata.exception';
import { EventMetadataRestApiExceptionFilter } from 'src/engine/metadata-modules/event-metadata/filters/event-metadata-rest-api-exception.filter';
import { EventRealtimeService } from 'src/engine/metadata-modules/event-metadata/services/event-realtime.service';
import { MemberEventSubscriptionService } from 'src/engine/metadata-modules/event-metadata/services/member-event-subscription.service';
import { streamEventOccurrences } from 'src/engine/metadata-modules/event-metadata/utils/stream-event-occurrences.util';

@Controller(`${ApiPath.Rest}/${ApiPath.AppEvents}`)
@UseGuards(
  JwtAuthGuard,
  AuthPrincipalGuard({
    userSession: false,
    apiKey: false,
    oauthClient: false,
    application: { withUser: true, withoutUser: false },
  }),
  NoPermissionGuard,
)
@UseFilters(
  RestApiExceptionFilter,
  AuthRestApiExceptionFilter,
  EventMetadataRestApiExceptionFilter,
)
export class MemberEventStreamController {
  constructor(
    private readonly memberEventSubscriptionService: MemberEventSubscriptionService,
    private readonly eventRealtimeService: EventRealtimeService,
    private readonly jwtWrapperService: JwtWrapperService,
  ) {}

  @Post('stream')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async stream(
    @Req() request: Request,
    @Res() response: Response,
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthApplication() application: FlatApplication,
    @Body() memberEventStreamInput: MemberEventStreamInput,
  ): Promise<void> {
    const authContext = getWorkspaceAuthContext();

    const subscriptions =
      await this.memberEventSubscriptionService.resolveOrThrow({
        workspaceId: workspace.id,
        applicationId: application.id,
        subscriptions: memberEventStreamInput.subscriptions,
      });

    const canReadAllRecords = () =>
      this.memberEventSubscriptionService.canReadAllRecords({
        authContext,
        subscriptions,
      });

    if (!(await canReadAllRecords())) {
      throw new EventMetadataException(
        'You cannot read every record these subscriptions are scoped to',
        EventMetadataExceptionCode.EVENT_SUBSCRIPTION_FORBIDDEN,
      );
    }

    await streamEventOccurrences({
      request,
      response,
      subscribe: (onOccurrence) =>
        this.eventRealtimeService.subscribe({
          channels: subscriptions.map(({ channel }) => channel),
          onOccurrence,
        }),
      closeAt: this.getAccessTokenExpiration(request),
      reauthorize: canReadAllRecords,
    });
  }

  private getAccessTokenExpiration(request: Request): Date | undefined {
    const accessToken = this.jwtWrapperService.extractJwtFromRequest()(request);
    const expiresAtInSeconds = isDefined(accessToken)
      ? this.jwtWrapperService.decode<{ exp?: number }>(accessToken)?.exp
      : undefined;

    return isDefined(expiresAtInSeconds)
      ? new Date(expiresAtInSeconds * 1000)
      : undefined;
  }
}
