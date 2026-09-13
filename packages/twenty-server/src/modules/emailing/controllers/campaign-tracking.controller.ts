import {
  BadRequestException,
  Controller,
  Get,
  Header,
  Headers,
  NotFoundException,
  Param,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type Request } from 'express';
import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CAMPAIGN_TRACKING_TOKEN_FORMAT } from 'src/engine/core-modules/emailing-domain/constants/campaign-tracking-token-format.constant';
import { CampaignTrackingTokenService } from 'src/engine/core-modules/emailing-domain/services/campaign-tracking-token.service';
import { type CampaignTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/campaign-tracking-token-payload.type';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { ShortLinkService } from 'src/engine/core-modules/short-link/services/short-link.service';
import { ThrottlerException } from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { throttlerToRestApiExceptionHandler } from 'src/engine/core-modules/throttler/utils/throttler-to-rest-api-exception-handler.util';
import { CampaignEngagementCaptureService } from 'src/modules/emailing/services/campaign-engagement-capture.service';

const FOUND_STATUS_CODE = 302;

const REQUESTER_RATE_LIMIT = { maxRequests: 600, windowMs: 60_000 };

@Controller(ApiPath.Emailing)
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
export class CampaignTrackingController {
  constructor(
    private readonly campaignTrackingTokenService: CampaignTrackingTokenService,
    private readonly shortLinkService: ShortLinkService,
    private readonly campaignEngagementCaptureService: CampaignEngagementCaptureService,
    private readonly throttlerService: ThrottlerService,
  ) {}

  @Get('c/:token')
  @Redirect()
  @Header('Cache-Control', 'no-store')
  @Header('Referrer-Policy', 'no-referrer')
  async click(
    @Param('token') token: string,
    @Headers('user-agent') userAgent: string | undefined,
    @Req() request: Request,
  ): Promise<{ url: string; statusCode: number }> {
    await this.throttleByRequesterOrThrow(request);

    const payload = this.verifyTokenOrThrow(token);

    const shortLink = await this.shortLinkService.findById(payload.shortLinkId);

    if (!isDefined(shortLink)) {
      throw new NotFoundException('Unknown tracked link');
    }

    await this.campaignEngagementCaptureService.capture({
      payload,
      userAgent: userAgent ?? null,
    });

    return { url: shortLink.url, statusCode: FOUND_STATUS_CODE };
  }

  private async throttleByRequesterOrThrow(request: Request): Promise<void> {
    try {
      await this.throttlerService.tokenBucketThrottleOrThrow(
        `campaign-tracking:requester:${request.ip ?? 'unknown-requester'}`,
        1,
        REQUESTER_RATE_LIMIT.maxRequests,
        REQUESTER_RATE_LIMIT.windowMs,
      );
    } catch (error) {
      if (error instanceof ThrottlerException) {
        throttlerToRestApiExceptionHandler(error);
      }

      throw error;
    }
  }

  private verifyTokenOrThrow(token: string): CampaignTrackingTokenPayload {
    if (
      !isNonEmptyString(token) ||
      !CAMPAIGN_TRACKING_TOKEN_FORMAT.test(token)
    ) {
      throw new BadRequestException('Malformed tracking token');
    }

    const payload = this.campaignTrackingTokenService.verify(token);

    if (!isDefined(payload)) {
      throw new BadRequestException('Invalid tracking token');
    }

    return payload;
  }
}
