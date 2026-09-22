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
import { isDefined } from 'twenty-shared/utils';

import { UnsubscribeTokenService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-token.service';
import { type UnsubscribeTokenVerification } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-token-verification.type';
import { buildUnsubscribePreferencesPage } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-preferences-page.util';
import { buildUnsubscribeResultPage } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-result-page.util';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { ThrottlerException } from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { throttlerToRestApiExceptionHandler } from 'src/engine/core-modules/throttler/utils/throttler-to-rest-api-exception-handler.util';
import { MessageTrackingConsentDecision } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-decision.type';
import { MessageTrackingConsentSource } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-source.type';
import { MessageSuppressionService } from 'src/modules/emailing/services/message-suppression.service';
import { MessageTrackingConsentService } from 'src/modules/emailing/services/message-tracking-consent.service';

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
  tracking?: string;
};

const RATE_LIMIT = { maxRequests: 120, windowMs: 60_000 };
const RESUBSCRIBE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

@Controller(`${ApiPath.Emailing}/unsubscribe`)
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
export class UnsubscribeController {
  constructor(
    private readonly unsubscribeTokenService: UnsubscribeTokenService,
    private readonly messageSuppressionService: MessageSuppressionService,
    private readonly messageTrackingConsentService: MessageTrackingConsentService,
    private readonly throttlerService: ThrottlerService,
  ) {}

  private async throttleOrThrow(bucketKey: string): Promise<void> {
    try {
      await this.throttlerService.tokenBucketThrottleOrThrow(
        bucketKey,
        1,
        RATE_LIMIT.maxRequests,
        RATE_LIMIT.windowMs,
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
  async handleOneClickUnsubscribe(
    @Query('t') token: string,
    @Req() request: Request,
  ): Promise<void> {
    await this.throttleByRequesterOrThrow(request);

    const { payload } = this.verifyTokenOrThrow(token);

    await this.throttleByTokenOrThrow(token);

    if (payload.preview === true) {
      return;
    }

    await this.messageSuppressionService.unsubscribeFromEverything({
      workspaceId: payload.workspaceId,
      emailAddress: payload.emailAddress,
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

    const [topics, trackingPreference] = isExpired
      ? [[], undefined]
      : await Promise.all([
          this.messageSuppressionService.getTopicOptOutState({
            workspaceId: payload.workspaceId,
            emailAddress: payload.emailAddress,
          }),
          this.messageTrackingConsentService.findTrackingPreference({
            workspaceId: payload.workspaceId,
            emailAddress: payload.emailAddress,
          }),
        ]);

    return buildUnsubscribePreferencesPage({
      token,
      topics,
      trackingPreference,
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
        maxAgeMs: RESUBSCRIBE_MAX_AGE_MS,
      }),
    });

    const trackingDecision = this.parseTrackingDecision(body.tracking);

    if (isDefined(trackingDecision)) {
      await this.recordTrackingDecisionUnlessRecorded({
        workspaceId: payload.workspaceId,
        emailAddress: payload.emailAddress,
        decision: trackingDecision,
      });
    }

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

    await this.messageSuppressionService.unsubscribeFromEverything({
      workspaceId: payload.workspaceId,
      emailAddress: payload.emailAddress,
    });

    return buildUnsubscribeResultPage(
      'You have been unsubscribed',
      'You will no longer receive marketing emails from this sender.',
    );
  }

  private async recordTrackingDecisionUnlessRecorded({
    workspaceId,
    emailAddress,
    decision,
  }: {
    workspaceId: string;
    emailAddress: string;
    decision: MessageTrackingConsentDecision;
  }): Promise<void> {
    const storedConsent = await this.messageTrackingConsentService.findConsent({
      workspaceId,
      emailAddress,
    });
    const isDefaultDecision =
      !isDefined(storedConsent) &&
      decision === MessageTrackingConsentDecision.GRANTED;
    const isRecipientDecision =
      storedConsent?.decision === decision &&
      storedConsent.source === MessageTrackingConsentSource.PREFERENCES_PAGE;

    if (isDefaultDecision || isRecipientDecision) {
      return;
    }

    await this.messageTrackingConsentService.recordDecision({
      workspaceId,
      emailAddress,
      decision,
      source: MessageTrackingConsentSource.PREFERENCES_PAGE,
    });
  }

  private parseTrackingDecision(
    tracking: string | undefined,
  ): MessageTrackingConsentDecision | undefined {
    switch (tracking) {
      case MessageTrackingConsentDecision.GRANTED:
        return MessageTrackingConsentDecision.GRANTED;
      case MessageTrackingConsentDecision.DENIED:
        return MessageTrackingConsentDecision.DENIED;
      default:
        return undefined;
    }
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
