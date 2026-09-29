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
  Res,
  UseGuards,
} from '@nestjs/common';
import { isNonEmptyString } from '@sniptt/guards';
import { type Request, type Response } from 'express';
import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CampaignTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/campaign-tracking-token-payload.type';
import { decodeCampaignOpenTrackingToken } from 'src/engine/core-modules/emailing-domain/utils/decode-campaign-open-tracking-token.util';
import { decodeCampaignTrackingToken } from 'src/engine/core-modules/emailing-domain/utils/decode-campaign-tracking-token.util';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { ShortLinkService } from 'src/engine/core-modules/short-link/services/short-link.service';
import { TRACKABLE_URL_PATTERN } from 'src/modules/emailing/constants/trackable-url-pattern.constant';
import { CampaignEngagementCaptureService } from 'src/modules/emailing/services/campaign-engagement-capture.service';

const FOUND_STATUS_CODE = 302;

const CAMPAIGN_TRACKING_TOKEN_FORMAT = /^[A-Za-z0-9_-]+$/;

const OPEN_PIXEL_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64',
);

@Controller(ApiPath.Emailing)
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
export class CampaignTrackingController {
  constructor(
    private readonly shortLinkService: ShortLinkService,
    private readonly campaignEngagementCaptureService: CampaignEngagementCaptureService,
  ) {}

  @Get('c/:token')
  @Redirect()
  @Header('Cache-Control', 'no-store')
  @Header('Referrer-Policy', 'no-referrer')
  async handleTrackedLinkClick(
    @Param('token') token: string,
    @Headers('user-agent') userAgent: string | undefined,
    @Req() request: Request,
  ): Promise<{ url: string; statusCode: number }> {
    const payload = this.decodeTokenOrThrow(token);
    const shortLink = await this.shortLinkService.findById({
      workspaceId: payload.workspaceId,
      shortLinkId: payload.shortLinkId,
    });

    if (!isDefined(shortLink)) {
      throw new NotFoundException('Unknown tracked link');
    }

    const destinationUrl = shortLink.resolvedDestinationUrl;

    if (
      /[\r\n]/.test(destinationUrl) ||
      !TRACKABLE_URL_PATTERN.test(destinationUrl) ||
      !URL.canParse(destinationUrl)
    ) {
      throw new NotFoundException('Invalid tracked link destination');
    }

    await this.campaignEngagementCaptureService.capture({
      engagement: { type: 'CLICK', ...payload },
      userAgent: userAgent ?? null,
      requesterIp: request.ip ?? null,
    });

    return { url: destinationUrl, statusCode: FOUND_STATUS_CODE };
  }

  @Get('o/:token')
  async handleOpenPixel(
    @Param('token') token: string,
    @Headers('user-agent') userAgent: string | undefined,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const payload = CAMPAIGN_TRACKING_TOKEN_FORMAT.test(token)
      ? decodeCampaignOpenTrackingToken(token)
      : null;

    if (isDefined(payload)) {
      await this.campaignEngagementCaptureService.capture({
        engagement: { type: 'OPEN', ...payload },
        userAgent: userAgent ?? null,
        requesterIp: request.ip ?? null,
      });
    }

    response
      .set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Referrer-Policy': 'no-referrer',
        'Content-Type': 'image/gif',
        'Content-Length': String(OPEN_PIXEL_GIF.length),
      })
      .end(OPEN_PIXEL_GIF);
  }

  private decodeTokenOrThrow(token: string): CampaignTrackingTokenPayload {
    if (
      !isNonEmptyString(token) ||
      !CAMPAIGN_TRACKING_TOKEN_FORMAT.test(token)
    ) {
      throw new BadRequestException('Malformed tracking token');
    }

    const payload = decodeCampaignTrackingToken(token);

    if (!isDefined(payload)) {
      throw new BadRequestException('Invalid tracking token');
    }

    return payload;
  }
}
