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
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { type Request } from 'express';
import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { UnsubscribeTokenService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-token.service';
import { type UnsubscribePageSender } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-page-sender.type';
import { type UnsubscribePageTracking } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-page-tracking.type';
import { type UnsubscribeTokenPayload } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-token-payload.type';
import { type UnsubscribeTokenVerification } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-token-verification.type';
import { buildUnsubscribePreferencesPage } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-preferences-page.util';
import { buildUnsubscribeResultPage } from 'src/engine/core-modules/emailing-domain/utils/build-unsubscribe-result-page.util';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { ThrottlerException } from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { throttlerToRestApiExceptionHandler } from 'src/engine/core-modules/throttler/utils/throttler-to-rest-api-exception-handler.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { RecipientPageExceptionFilter } from 'src/modules/emailing/filters/recipient-page-exception.filter';
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
  tracking?: string;
};

const RATE_LIMIT = { maxRequests: 120, windowMs: 60_000 };
const RESUBSCRIBE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

@Controller(`${ApiPath.Emailing}/unsubscribe`)
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
@UseFilters(RecipientPageExceptionFilter)
export class UnsubscribeController {
  constructor(
    private readonly unsubscribeTokenService: UnsubscribeTokenService,
    private readonly messageSuppressionService: MessageSuppressionService,
    private readonly throttlerService: ThrottlerService,
    private readonly fileUrlService: FileUrlService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
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

    const workspace = await this.workspaceRepository.findOneBy({
      id: payload.workspaceId,
    });

    const [sender, topics, tracking] = await Promise.all([
      this.getSender(workspace),
      isExpired
        ? []
        : this.messageSuppressionService.getTopicOptOutState({
            workspaceId: payload.workspaceId,
            emailAddress: payload.emailAddress,
          }),
      isExpired ? undefined : this.getTracking(workspace, payload),
    ]);

    return buildUnsubscribePreferencesPage({
      token,
      sender,
      emailAddress: payload.emailAddress,
      topics,
      tracking,
      updatePath: UPDATE_PREFERENCES_PATH,
      unsubscribeAllPath: UNSUBSCRIBE_ALL_PATH,
    });
  }

  private async getSender(
    workspace: WorkspaceEntity | null,
  ): Promise<UnsubscribePageSender> {
    if (!isDefined(workspace)) {
      return { name: null, logoUrl: null };
    }

    return {
      name: workspace.displayName ?? null,
      logoUrl: await this.fileUrlService.signWorkspaceLogoUrl(workspace),
    };
  }

  private async getTracking(
    workspace: WorkspaceEntity | null,
    { workspaceId, emailAddress }: UnsubscribeTokenPayload,
  ): Promise<UnsubscribePageTracking | undefined> {
    if (!isDefined(workspace)) {
      return undefined;
    }

    return {
      isOptedOut: await this.messageSuppressionService.isTrackingOptedOut({
        workspaceId,
        emailAddress,
      }),
      isOpenTrackingEnabled: workspace.isCampaignOpenTrackingEnabled,
      isClickTrackingEnabled: workspace.isCampaignClickTrackingEnabled,
    };
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

    const trackingChoice = this.parseTrackingChoice(body.tracking);

    if (isDefined(trackingChoice)) {
      await this.messageSuppressionService.setTrackingOptOut({
        workspaceId: payload.workspaceId,
        emailAddress: payload.emailAddress,
        isOptedOut: trackingChoice === 'OPTED_OUT',
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

  private parseTrackingChoice(
    tracking: string | undefined,
  ): 'TRACKED' | 'OPTED_OUT' | undefined {
    switch (tracking) {
      case 'TRACKED':
        return 'TRACKED';
      case 'OPTED_OUT':
        return 'OPTED_OUT';
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
