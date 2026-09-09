import {
  BadRequestException,
  Controller,
  Get,
  Header,
  Headers,
  NotFoundException,
  Param,
  Redirect,
  UseGuards,
} from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CAMPAIGN_TRACKING_TOKEN_FORMAT } from 'src/engine/core-modules/emailing-domain/constants/campaign-tracking-token.constant';
import { CampaignTrackingTokenService } from 'src/engine/core-modules/emailing-domain/services/campaign-tracking-token.service';
import { type CampaignTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/campaign-tracking-token-payload.type';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { CampaignEngagementCaptureService } from 'src/modules/emailing/services/campaign-engagement-capture.service';
import { MessageCampaignLinkService } from 'src/modules/emailing/services/message-campaign-link.service';

const FOUND_STATUS_CODE = 302;

// The reader's outcome is decided before analytics runs: a valid click always
// reaches its stored destination, whatever the capture path does.
@Controller(ApiPath.Emailing)
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
export class CampaignTrackingController {
  constructor(
    private readonly campaignTrackingTokenService: CampaignTrackingTokenService,
    private readonly messageCampaignLinkService: MessageCampaignLinkService,
    private readonly campaignEngagementCaptureService: CampaignEngagementCaptureService,
  ) {}

  @Get('c/:token')
  @Redirect()
  @Header('Cache-Control', 'no-store')
  @Header('Referrer-Policy', 'no-referrer')
  async click(
    @Param('token') token: string,
    @Headers('user-agent') userAgent: string | undefined,
  ): Promise<{ url: string; statusCode: number }> {
    const payload = this.verifyTokenOrThrow(token);

    const destination = await this.messageCampaignLinkService.findDestination(
      payload.destinationId,
    );

    if (!isDefined(destination)) {
      throw new NotFoundException('Unknown tracked link');
    }

    await this.campaignEngagementCaptureService.capture({
      token,
      payload,
      userAgent: userAgent ?? null,
    });

    return { url: destination.url, statusCode: FOUND_STATUS_CODE };
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
