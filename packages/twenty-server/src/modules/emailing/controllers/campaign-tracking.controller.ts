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

import { CAMPAIGN_TRACKING_TOKEN_FORMAT } from 'src/engine/core-modules/emailing-domain/constants/campaign-tracking-token-format.constant';
import { CampaignTrackingTokenService } from 'src/engine/core-modules/emailing-domain/services/campaign-tracking-token.service';
import { type CampaignTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/campaign-tracking-token-payload.type';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { ShortLinkService } from 'src/engine/core-modules/short-link/services/short-link.service';
import { CAMPAIGN_OPEN_PIXEL_GIF } from 'src/modules/emailing/constants/campaign-open-pixel-gif.constant';
import { CampaignEngagementCaptureService } from 'src/modules/emailing/services/campaign-engagement-capture.service';

const FOUND_STATUS_CODE = 302;

@Controller(ApiPath.Emailing)
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
export class CampaignTrackingController {
  constructor(
    private readonly campaignTrackingTokenService: CampaignTrackingTokenService,
    private readonly shortLinkService: ShortLinkService,
    private readonly campaignEngagementCaptureService: CampaignEngagementCaptureService,
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
    const payload = this.verifyTokenOrThrow(token, 'CLICK');

    const shortLink = await this.shortLinkService.findById(payload.shortLinkId);

    if (!isDefined(shortLink)) {
      throw new NotFoundException('Unknown tracked link');
    }

    await this.campaignEngagementCaptureService.capture({
      payload,
      userAgent: userAgent ?? null,
      requesterIp: request.ip ?? null,
    });

    return { url: shortLink.url, statusCode: FOUND_STATUS_CODE };
  }

  @Get('o/:token')
  async open(
    @Param('token') token: string,
    @Headers('user-agent') userAgent: string | undefined,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const payload = this.verifyTokenOrThrow(token, 'OPEN');

    await this.campaignEngagementCaptureService.capture({
      payload,
      userAgent: userAgent ?? null,
      requesterIp: request.ip ?? null,
    });

    response
      .set({
        'Cache-Control': 'no-store',
        'Referrer-Policy': 'no-referrer',
        'Content-Type': 'image/gif',
        'Content-Length': String(CAMPAIGN_OPEN_PIXEL_GIF.length),
      })
      .end(CAMPAIGN_OPEN_PIXEL_GIF);
  }

  private verifyTokenOrThrow<
    TPurpose extends CampaignTrackingTokenPayload['purpose'],
  >(
    token: string,
    purpose: TPurpose,
  ): Extract<CampaignTrackingTokenPayload, { purpose: TPurpose }> {
    if (
      !isNonEmptyString(token) ||
      !CAMPAIGN_TRACKING_TOKEN_FORMAT.test(token)
    ) {
      throw new BadRequestException('Malformed tracking token');
    }

    const payload = this.campaignTrackingTokenService.verify(token);

    if (!isDefined(payload) || payload.purpose !== purpose) {
      throw new BadRequestException('Invalid tracking token');
    }

    return payload as Extract<
      CampaignTrackingTokenPayload,
      { purpose: TPurpose }
    >;
  }
}
