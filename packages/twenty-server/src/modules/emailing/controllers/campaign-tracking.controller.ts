import {
  BadRequestException,
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  Redirect,
  UseGuards,
} from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CampaignTrackingTokenService } from 'src/engine/core-modules/emailing-domain/services/campaign-tracking-token.service';
import { type CampaignTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/campaign-tracking-token-payload.type';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { ShortLinkService } from 'src/engine/core-modules/short-link/services/short-link.service';

const FOUND_STATUS_CODE = 302;

const CAMPAIGN_TRACKING_TOKEN_FORMAT = /^[A-Za-z0-9_-]{72}$/;

@Controller(ApiPath.Emailing)
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
export class CampaignTrackingController {
  constructor(
    private readonly campaignTrackingTokenService: CampaignTrackingTokenService,
    private readonly shortLinkService: ShortLinkService,
  ) {}

  @Get('c/:token')
  @Redirect()
  @Header('Cache-Control', 'no-store')
  @Header('Referrer-Policy', 'no-referrer')
  async click(
    @Param('token') token: string,
  ): Promise<{ url: string; statusCode: number }> {
    const payload = this.verifyTokenOrThrow(token);

    const shortLink = await this.shortLinkService.findById(payload.shortLinkId);

    if (!isDefined(shortLink)) {
      throw new NotFoundException('Unknown tracked link');
    }

    return { url: shortLink.url, statusCode: FOUND_STATUS_CODE };
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
