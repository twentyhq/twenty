import {
  BadRequestException,
  Controller,
  Get,
  Header,
  Logger,
  NotFoundException,
  Param,
  Redirect,
  UseGuards,
} from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CLICK_TRACKING_TOKEN_FORMAT } from 'src/engine/core-modules/emailing-domain/constants/click-tracking-token.constant';
import { type MessageCampaignLinkEntity } from 'src/engine/core-modules/emailing-domain/message-campaign-link.entity';
import { ClickTrackingTokenService } from 'src/engine/core-modules/emailing-domain/services/click-tracking-token.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { MessageCampaignLinkService } from 'src/modules/emailing/services/message-campaign-link.service';
import { MessageCampaignStatisticsService } from 'src/modules/emailing/services/message-campaign-statistics.service';

const FOUND_STATUS_CODE = 302;

@Controller(`${ApiPath.Emailing}/c`)
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
export class ClickTrackingController {
  private readonly logger = new Logger(ClickTrackingController.name);

  constructor(
    private readonly clickTrackingTokenService: ClickTrackingTokenService,
    private readonly messageCampaignLinkService: MessageCampaignLinkService,
    private readonly messageCampaignStatisticsService: MessageCampaignStatisticsService,
  ) {}

  @Get(':token')
  @Redirect()
  @Header('Cache-Control', 'no-store')
  async redirectToDestination(
    @Param('token') token: string,
  ): Promise<{ url: string; statusCode: number }> {
    const payload = this.verifyTokenOrThrow(token);

    const link = await this.messageCampaignLinkService.findLinkById(
      payload.messageCampaignLinkId,
    );

    if (!isDefined(link)) {
      throw new NotFoundException('Unknown tracked link');
    }

    await this.recordClick({ link, messageId: payload.messageId });

    return { url: link.url, statusCode: FOUND_STATUS_CODE };
  }

  private async recordClick({
    link,
    messageId,
  }: {
    link: MessageCampaignLinkEntity;
    messageId: string;
  }): Promise<void> {
    await this.messageCampaignLinkService.recordClick({
      workspaceId: link.workspaceId,
      messageCampaignLinkId: link.id,
      messageId,
    });

    await this.messageCampaignStatisticsService
      .scheduleRefresh({
        workspaceId: link.workspaceId,
        campaignId: link.messageCampaignId,
      })
      .catch((error) => {
        this.logger.warn(
          `Recorded click on link ${link.id} but could not schedule a statistics refresh: ${error}`,
        );
      });
  }

  private verifyTokenOrThrow(token: string) {
    if (!isNonEmptyString(token) || !CLICK_TRACKING_TOKEN_FORMAT.test(token)) {
      throw new BadRequestException('Malformed click tracking token');
    }

    const payload = this.clickTrackingTokenService.verify(token);

    if (payload === null) {
      throw new BadRequestException('Invalid click tracking token');
    }

    return payload;
  }
}
