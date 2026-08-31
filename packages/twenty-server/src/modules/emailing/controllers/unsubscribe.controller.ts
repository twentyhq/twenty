import { UNSUBSCRIBE_RATE_LIMIT_WINDOW_MS } from 'src/modules/emailing/constants/unsubscribe-rate-limit-window-ms.constant';
import { UNSUBSCRIBE_RATE_LIMIT_MAX_REQUESTS } from 'src/modules/emailing/constants/unsubscribe-rate-limit-max-requests.constant';
import { UNSUBSCRIBE_RESUBSCRIBE_MAX_AGE_MS } from 'src/engine/core-modules/emailing-domain/constants/unsubscribe-resubscribe-max-age-ms.constant';
import { isUnsubscribeTokenExpired } from 'src/engine/core-modules/emailing-domain/utils/is-unsubscribe-token-expired.util';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type Request } from 'express';
import { ApiPath } from 'twenty-shared/types';

import { UnsubscribeTokenService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-token.service';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { MessageSuppressionSource } from 'src/engine/core-modules/emailing-domain/types/message-suppression-source.type';
import { type UnsubscribeTokenVerification } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-token-verification.type';
import { buildUnsubscribePreferencesPage } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-preferences-page.util';
import { buildUnsubscribeResultPage } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-result-page.util';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { ThrottlerException } from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { throttlerToRestApiExceptionHandler } from 'src/engine/core-modules/throttler/utils/throttler-to-rest-api-exception-handler.util';
import { MessageSuppressionService } from 'src/modules/emailing/services/message-suppression.service';

const UNSUBSCRIBE_TOKEN_FORMAT = /^[A-Za-z0-9_-]{1,1024}$/;

const UPDATE_PREFERENCES_PATH = `/${ApiPath.Emailing}/unsubscribe/preferences`;
const UNSUBSCRIBE_ALL_PATH = `/${ApiPath.Emailing}/unsubscribe/all`;

const HTML_CONTENT_TYPE = 'text/html; charset=utf-8';

const PREVIEW_RESULT_PAGE = buildUnsubscribeResultPage(
  'Preview',
  'This is a preview — no changes were saved.',
);

type UnsubscribeFormBody = {
  t?: string;
  unsubscribeTopicId?: string | string[];
};

@Controller(`${ApiPath.Emailing}/unsubscribe`)
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
export class UnsubscribeController {
  constructor(
    private readonly unsubscribeTokenService: UnsubscribeTokenService,
    private readonly messageSuppressionService: MessageSuppressionService,
    private readonly throttlerService: ThrottlerService,
  ) {}

  private async throttleOrThrow(bucketKey: string): Promise<void> {
    try {
      await this.throttlerService.tokenBucketThrottleOrThrow(
        bucketKey,
        1,
        UNSUBSCRIBE_RATE_LIMIT_MAX_REQUESTS,
        UNSUBSCRIBE_RATE_LIMIT_WINDOW_MS,
      );
    } catch (error) {
      if (error instanceof ThrottlerException) {
        throttlerToRestApiExceptionHandler(error);
      }

      throw error;
    }
  }

  private async throttleByRequesterOrThrow(request: Request): Promise<void> {
    await this.throttleOrThrow(
      `unsubscribe:requester:${request.ip ?? 'unknown-requester'}`,
    );
  }

  private async throttleByTokenOrThrow(token: string): Promise<void> {
    await this.throttleOrThrow(`unsubscribe:token:${token}`);
  }

  @Post()
  @HttpCode(200)
  async handleOneClickUnsubscribe(@Query('t') token: string): Promise<void> {
    await this.throttleByTokenOrThrow(token);

    const { payload } = this.verifyTokenOrThrow(token);

    if (payload.preview === true) {
      return;
    }

    await this.messageSuppressionService.suppress({
      workspaceId: payload.workspaceId,
      emailAddress: payload.emailAddress,
      reason: MessageSuppressionReason.UNSUBSCRIBE,
      source: MessageSuppressionSource.SYSTEM,
      unsubscribeTopicId: null,
    });
  }

  @Get()
  @Header('Content-Type', HTML_CONTENT_TYPE)
  async handlePreferencesPage(
    @Query('t') token: string,
    @Req() request: Request,
  ): Promise<string> {
    await this.throttleByRequesterOrThrow(request);

    const { payload, isExpired } = this.verifyTokenOrThrow(token);

    const topics = isExpired
      ? []
      : await this.messageSuppressionService.getTopicOptOutState({
          workspaceId: payload.workspaceId,
          emailAddress: payload.emailAddress,
        });

    return buildUnsubscribePreferencesPage({
      token,
      topics,
      updatePath: UPDATE_PREFERENCES_PATH,
      unsubscribeAllPath: UNSUBSCRIBE_ALL_PATH,
    });
  }

  @Post('preferences')
  @Header('Content-Type', HTML_CONTENT_TYPE)
  async handleUpdatePreferences(
    @Body() body: UnsubscribeFormBody,
    @Req() request: Request,
  ): Promise<string> {
    await this.throttleByRequesterOrThrow(request);

    const { payload, isExpired } = this.verifyTokenOrThrow(body.t);

    if (isExpired) {
      throw new BadRequestException('Expired unsubscribe token');
    }

    if (payload.preview === true) {
      return PREVIEW_RESULT_PAGE;
    }

    await this.messageSuppressionService.setTopicOptOuts({
      workspaceId: payload.workspaceId,
      emailAddress: payload.emailAddress,
      keptTopicIds: this.normalizeTopicIds(body.unsubscribeTopicId),
      canResubscribe: !isUnsubscribeTokenExpired({
        issuedAt: payload.issuedAt,
        now: Date.now(),
        maxAgeMs: UNSUBSCRIBE_RESUBSCRIBE_MAX_AGE_MS,
      }),
    });

    return buildUnsubscribeResultPage(
      'Preferences updated',
      'Your email preferences have been saved.',
    );
  }

  @Post('all')
  @Header('Content-Type', HTML_CONTENT_TYPE)
  async handleUnsubscribeAll(
    @Body() body: UnsubscribeFormBody,
    @Req() request: Request,
  ): Promise<string> {
    await this.throttleByRequesterOrThrow(request);

    const { payload } = this.verifyTokenOrThrow(body.t);

    if (payload.preview === true) {
      return PREVIEW_RESULT_PAGE;
    }

    await this.messageSuppressionService.suppress({
      workspaceId: payload.workspaceId,
      emailAddress: payload.emailAddress,
      reason: MessageSuppressionReason.UNSUBSCRIBE,
      source: MessageSuppressionSource.SYSTEM,
    });

    return buildUnsubscribeResultPage(
      'You have been unsubscribed',
      'You will no longer receive marketing emails from this sender.',
    );
  }

  private normalizeTopicIds(
    unsubscribeTopicId: string | string[] | undefined,
  ): string[] {
    if (Array.isArray(unsubscribeTopicId)) {
      return unsubscribeTopicId.filter(isNonEmptyString);
    }

    return isNonEmptyString(unsubscribeTopicId) ? [unsubscribeTopicId] : [];
  }

  private verifyTokenOrThrow(
    token: string | undefined,
  ): UnsubscribeTokenVerification {
    if (!isNonEmptyString(token) || !UNSUBSCRIBE_TOKEN_FORMAT.test(token)) {
      throw new BadRequestException('Malformed unsubscribe token');
    }

    const verification = this.unsubscribeTokenService.verify(token);

    if (verification === null) {
      throw new BadRequestException('Invalid unsubscribe token');
    }

    return verification;
  }
}
