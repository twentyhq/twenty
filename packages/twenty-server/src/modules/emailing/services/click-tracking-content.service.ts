/* @license Enterprise */
import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ManagedHostnameStatus } from 'src/engine/core-modules/dns-manager/types/managed-hostname-status.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { ClickTrackingTokenService } from 'src/engine/core-modules/emailing-domain/services/click-tracking-token.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
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
    const clickTrackingHostname = await this.findServableHostname(
      workspaceId,
      emailingDomainId,
    );

    if (!isDefined(clickTrackingHostname)) {
      return html;
    }

    const linkIdByUrl = await this.resolveLinkIdsInHtml({
      workspaceId,
      messageCampaignId,
      html,
    });

    if (linkIdByUrl.size === 0) {
      return html;
    }

    const trackedUrlByUrl = new Map(
      [...linkIdByUrl].map(([url, messageCampaignLinkId]) => [
        url,
        this.buildTrackedUrl({
          clickTrackingHostname,
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
    const clickTrackingHostname = await this.findServableHostname(
      workspaceId,
      emailingDomainId,
    );

    if (!isDefined(clickTrackingHostname)) {
      return undefined;
    }

    const linkIdByUrl = await this.resolveLinkIdsInHtml({
      workspaceId,
      messageCampaignId,
      html,
    });

    if (linkIdByUrl.size === 0) {
      return undefined;
    }

    const tagByUrl = new Map(
      [...linkIdByUrl.keys()].map((url, index) => [
        url,
        `{{${CLICK_TRACKING_TAG_PREFIX}_${index}}}`,
      ]),
    );

    return {
      html: replaceTrackableLinkUrls(html, tagByUrl),
      clickTrackingHostname,
      messageCampaignLinkIds: [...linkIdByUrl.values()],
    };
  }

  buildBatchReplacements({
    trackedBatchTemplate: { clickTrackingHostname, messageCampaignLinkIds },
    messageId,
  }: {
    trackedBatchTemplate: TrackedBatchTemplate;
    messageId: string;
  }): Record<string, string> {
    return Object.fromEntries(
      messageCampaignLinkIds.map((messageCampaignLinkId, index) => [
        `${CLICK_TRACKING_TAG_PREFIX}_${index}`,
        this.buildTrackedUrl({
          clickTrackingHostname,
          messageCampaignLinkId,
          messageId,
        }),
      ]),
    );
  }

  private async resolveLinkIdsInHtml({
    workspaceId,
    messageCampaignId,
    html,
  }: {
    workspaceId: string;
    messageCampaignId: string;
    html: string;
  }): Promise<Map<string, string>> {
    const urls = collectTrackableLinkUrls(html);

    if (urls.length === 0) {
      return new Map();
    }

    return this.messageCampaignLinkService.resolveLinkIdsByUrl({
      workspaceId,
      messageCampaignId,
      urls,
    });
  }

  private async findServableHostname(
    workspaceId: string,
    emailingDomainId: string,
  ): Promise<string | undefined> {
    const emailingDomain = await this.emailingDomainRepository.findOne(
      workspaceId,
      { where: { id: emailingDomainId } },
    );

    if (
      !isDefined(emailingDomain) ||
      !emailingDomain.clickTrackingEnabled ||
      emailingDomain.clickTrackingHostnameStatus !==
        ManagedHostnameStatus.ACTIVE ||
      !isNonEmptyString(emailingDomain.clickTrackingHostname)
    ) {
      return undefined;
    }

    return emailingDomain.clickTrackingHostname;
  }

  private buildTrackedUrl({
    clickTrackingHostname,
    messageCampaignLinkId,
    messageId,
  }: {
    clickTrackingHostname: string;
    messageCampaignLinkId: string;
    messageId: string;
  }): string {
    const token = this.clickTrackingTokenService.sign({
      messageCampaignLinkId,
      messageId,
    });

    return `https://${clickTrackingHostname}/${ApiPath.Emailing}/c/${token}`;
  }
}
