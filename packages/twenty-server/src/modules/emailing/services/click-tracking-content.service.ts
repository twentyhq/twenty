/* @license Enterprise */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ManagedHostnameStatus } from 'src/engine/core-modules/dns-manager/types/managed-hostname-status.type';
import { CLICK_TRACKING_HOSTNAME_PREFIX } from 'src/engine/core-modules/emailing-domain/constants/click-tracking-hostname-prefix.constant';
import { EmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-driver.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { ClickTrackingTokenService } from 'src/engine/core-modules/emailing-domain/services/click-tracking-token.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { CLICK_TRACKING_TAG_PREFIX } from 'src/modules/emailing/constants/click-tracking-tag-prefix.constant';
import { MessageCampaignLinkService } from 'src/modules/emailing/services/message-campaign-link.service';
import { type TrackedBatchTemplate } from 'src/modules/emailing/types/tracked-batch-template.type';
import { collectTrackableLinkUrls } from 'src/modules/emailing/utils/collect-trackable-link-urls.util';
import { replaceTrackableLinkUrls } from 'src/modules/emailing/utils/replace-trackable-link-urls.util';

type CampaignSendReference = {
  workspaceId: string;
  emailingDomainId: string;
  messageCampaignId: string;
};

@Injectable()
export class ClickTrackingContentService {
  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
    private readonly messageCampaignLinkService: MessageCampaignLinkService,
    private readonly clickTrackingTokenService: ClickTrackingTokenService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async applyTo({
    workspaceId,
    emailingDomainId,
    messageCampaignId,
    messageId,
    html,
  }: CampaignSendReference & {
    messageId: string;
    html: string;
  }): Promise<string> {
    const trackingContext = await this.resolveTrackingContext({
      workspaceId,
      emailingDomainId,
      messageCampaignId,
      html,
    });

    if (!isDefined(trackingContext)) {
      return html;
    }

    const { clickTrackingBaseUrl, linkIdByUrl } = trackingContext;

    const trackedUrlByUrl = new Map(
      [...linkIdByUrl].map(([url, messageCampaignLinkId]) => [
        url,
        this.buildTrackedUrl({
          clickTrackingBaseUrl,
          messageCampaignLinkId,
          messageId,
        }),
      ]),
    );

    return replaceTrackableLinkUrls(html, trackedUrlByUrl);
  }

  async prepareBatchTemplate({
    workspaceId,
    emailingDomainId,
    messageCampaignId,
    html,
  }: CampaignSendReference & { html: string }): Promise<
    TrackedBatchTemplate | undefined
  > {
    const trackingContext = await this.resolveTrackingContext({
      workspaceId,
      emailingDomainId,
      messageCampaignId,
      html,
    });

    if (!isDefined(trackingContext)) {
      return undefined;
    }

    const { clickTrackingBaseUrl, linkIdByUrl } = trackingContext;

    const tagByUrl = new Map(
      [...linkIdByUrl.keys()].map((url, index) => [
        url,
        `{{${CLICK_TRACKING_TAG_PREFIX}_${index}}}`,
      ]),
    );

    return {
      html: replaceTrackableLinkUrls(html, tagByUrl),
      clickTrackingBaseUrl,
      messageCampaignLinkIds: [...linkIdByUrl.values()],
    };
  }

  buildBatchReplacements({
    trackedBatchTemplate: { clickTrackingBaseUrl, messageCampaignLinkIds },
    messageId,
  }: {
    trackedBatchTemplate: TrackedBatchTemplate;
    messageId: string;
  }): Record<string, string> {
    return Object.fromEntries(
      messageCampaignLinkIds.map((messageCampaignLinkId, index) => [
        `${CLICK_TRACKING_TAG_PREFIX}_${index}`,
        this.buildTrackedUrl({
          clickTrackingBaseUrl,
          messageCampaignLinkId,
          messageId,
        }),
      ]),
    );
  }

  private async resolveTrackingContext({
    workspaceId,
    emailingDomainId,
    messageCampaignId,
    html,
  }: CampaignSendReference & { html: string }): Promise<
    | { clickTrackingBaseUrl: string; linkIdByUrl: Map<string, string> }
    | undefined
  > {
    const clickTrackingBaseUrl = await this.findServableBaseUrl({
      workspaceId,
      emailingDomainId,
    });

    if (!isDefined(clickTrackingBaseUrl)) {
      return undefined;
    }

    const urls = collectTrackableLinkUrls(html);

    if (urls.length === 0) {
      return undefined;
    }

    const linkIdByUrl =
      await this.messageCampaignLinkService.resolveLinkIdsByUrl({
        workspaceId,
        messageCampaignId,
        urls,
      });

    if (linkIdByUrl.size === 0) {
      return undefined;
    }

    return { clickTrackingBaseUrl, linkIdByUrl };
  }

  private async findServableBaseUrl({
    workspaceId,
    emailingDomainId,
  }: {
    workspaceId: string;
    emailingDomainId: string;
  }): Promise<string | undefined> {
    const emailingDomain = await this.emailingDomainRepository.findOne(
      workspaceId,
      { where: { id: emailingDomainId } },
    );

    if (!isDefined(emailingDomain) || !emailingDomain.isClickTrackingEnabled) {
      return undefined;
    }

    if (
      this.twentyConfigService.get('EMAILING_DOMAIN_DRIVER') ===
      EmailingDomainDriver.LOG
    ) {
      return this.buildLocalBaseUrl(workspaceId);
    }

    if (
      emailingDomain.clickTrackingHostnameStatus !==
        ManagedHostnameStatus.ACTIVE ||
      !isNonEmptyString(emailingDomain.clickTrackingHostname)
    ) {
      return undefined;
    }

    return `https://${emailingDomain.clickTrackingHostname}`;
  }

  private async buildLocalBaseUrl(
    workspaceId: string,
  ): Promise<string | undefined> {
    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    if (!isNonEmptyString(workspace?.subdomain)) {
      return undefined;
    }

    const baseUrl = new URL(this.twentyConfigService.get('SERVER_URL'));

    baseUrl.hostname = this.twentyConfigService.get('IS_MULTIWORKSPACE_ENABLED')
      ? `${CLICK_TRACKING_HOSTNAME_PREFIX}.${workspace.subdomain}.${baseUrl.hostname}`
      : `${CLICK_TRACKING_HOSTNAME_PREFIX}.${baseUrl.hostname}`;

    return baseUrl.origin;
  }

  private buildTrackedUrl({
    clickTrackingBaseUrl,
    messageCampaignLinkId,
    messageId,
  }: {
    clickTrackingBaseUrl: string;
    messageCampaignLinkId: string;
    messageId: string;
  }): string {
    const token = this.clickTrackingTokenService.sign({
      messageCampaignLinkId,
      messageId,
    });

    return `${clickTrackingBaseUrl}/${ApiPath.Emailing}/c/${token}`;
  }
}
