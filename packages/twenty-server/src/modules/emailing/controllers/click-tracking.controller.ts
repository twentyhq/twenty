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
import { ClickTrackingTokenService } from 'src/engine/core-modules/emailing-domain/services/click-tracking-token.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { MessageCampaignLinkService } from 'src/modules/emailing/services/message-campaign-link.service';

const FOUND_STATUS_CODE = 302;

@Controller(`${ApiPath.Emailing}/c`)
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
export class ClickTrackingController {
  private readonly logger = new Logger(ClickTrackingController.name);

  constructor(
    private readonly clickTrackingTokenService: ClickTrackingTokenService,
    private readonly messageCampaignLinkService: MessageCampaignLinkService,
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

    this.messageCampaignLinkService
      .recordClick({
        workspaceId: link.workspaceId,
        messageCampaignLinkId: link.id,
        messageId: payload.messageId,
      })
      .catch((error) => {
        this.logger.error(
          `Failed to record click on link ${link.id} of workspace ${link.workspaceId}: ${error}`,
        );
      });

    return { url: link.url, statusCode: FOUND_STATUS_CODE };
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
