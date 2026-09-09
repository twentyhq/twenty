/* @license Enterprise */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { toPlainText } from 'twenty-emails';
import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ManagedHostnameStatus } from 'src/engine/core-modules/dns-manager/types/managed-hostname-status.type';
import { TRACKING_HOSTNAME_PREFIX } from 'src/engine/core-modules/emailing-domain/constants/tracking-hostname-prefix.constant';
import { EmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-driver.type';
import { type EmailingDomainEmailTemplate } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-email-template.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { CampaignTrackingTokenService } from 'src/engine/core-modules/emailing-domain/services/campaign-tracking-token.service';
import { type CampaignMessagePart } from 'src/engine/core-modules/emailing-domain/types/campaign-message-part.type';
import { type CampaignTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/campaign-tracking-token-payload.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { CAMPAIGN_BATCH_VARIABLE_TAG_PATTERN } from 'src/modules/emailing/constants/campaign-batch-variable-tag-pattern.constant';
import { CAMPAIGN_TRACKING_TAG_PREFIX_BY_MESSAGE_PART } from 'src/modules/emailing/constants/campaign-tracking-tag.constant';
import { MessageCampaignLinkService } from 'src/modules/emailing/services/message-campaign-link.service';
import { type CampaignTrackingFlags } from 'src/modules/emailing/types/campaign-tracking-flags.type';
import { type TrackedCampaignBatch } from 'src/modules/emailing/types/tracked-campaign-batch.type';
import { collectTrackableLinkUrls } from 'src/modules/emailing/utils/collect-trackable-link-urls.util';
import { replaceTrackableLinkUrls } from 'src/modules/emailing/utils/replace-trackable-link-urls.util';
import { resolveTrackedLinkUrl } from 'src/modules/emailing/utils/resolve-tracked-link-url.util';

type TrackingRecipient = {
  deliveryId: string;
  replacements: Record<string, string>;
};

type PrepareBatchArgs = {
  workspaceId: string;
  emailingDomainId: string;
  campaign: { id: string } & CampaignTrackingFlags;
  template: EmailingDomainEmailTemplate;
  textPartHtml: string;
  variableNames: string[];
  recipients: TrackingRecipient[];
};

@Injectable()
export class CampaignTrackingContentService {
  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly messageCampaignLinkService: MessageCampaignLinkService,
    private readonly campaignTrackingTokenService: CampaignTrackingTokenService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  resolveTrackingFlagsForSend(
    emailingDomain: EmailingDomainEntity,
  ): CampaignTrackingFlags {
    const canServeTrackedUrls = this.canServeTrackedUrls(emailingDomain);

    return {
      isClickTrackingEnabled:
        emailingDomain.isClickTrackingEnabled && canServeTrackedUrls,
    };
  }

  async prepareBatch({
    workspaceId,
    emailingDomainId,
    campaign,
    template,
    textPartHtml,
    variableNames,
    recipients,
  }: PrepareBatchArgs): Promise<TrackedCampaignBatch> {
    const untracked = {
      template,
      replacementsByDeliveryId: new Map(
        recipients.map(({ deliveryId, replacements }) => [
          deliveryId,
          replacements,
        ]),
      ),
    };

    const html = template.html ?? '';

    if (!campaign.isClickTrackingEnabled || html.trim() === '') {
      return untracked;
    }

    const urlTemplates = collectTrackableLinkUrls(html);

    if (urlTemplates.length === 0) {
      return untracked;
    }

    const baseUrl = await this.findTrackingBaseUrl({
      workspaceId,
      emailingDomainId,
    });

    if (!isDefined(baseUrl)) {
      return untracked;
    }

    const destinationIdByUrl = await this.registerDestinations({
      workspaceId,
      messageCampaignId: campaign.id,
      urlTemplates,
      variableNames,
      recipients,
    });

    return {
      template: this.buildTrackedTemplate({
        template,
        textPartHtml,
        urlTemplates,
      }),
      replacementsByDeliveryId: new Map(
        recipients.map((recipient) => [
          recipient.deliveryId,
          {
            ...recipient.replacements,
            ...this.buildTrackingReplacements({
              baseUrl,
              recipient,
              urlTemplates,
              destinationIdByUrl,
            }),
          },
        ]),
      ),
    };
  }

  private buildTrackedTemplate({
    template,
    textPartHtml,
    urlTemplates,
  }: {
    template: EmailingDomainEmailTemplate;
    textPartHtml: string;
    urlTemplates: string[];
  }): EmailingDomainEmailTemplate {
    const tagByUrl = (messagePart: CampaignMessagePart) =>
      new Map(
        urlTemplates.map((urlTemplate, index) => [
          urlTemplate,
          `{{${this.buildLinkTag({ messagePart, index })}}}`,
        ]),
      );

    return {
      ...template,
      html: replaceTrackableLinkUrls(template.html ?? '', tagByUrl('HTML')),
      text: toPlainText(
        replaceTrackableLinkUrls(textPartHtml, tagByUrl('TEXT')),
      ),
    };
  }

  private async registerDestinations({
    workspaceId,
    messageCampaignId,
    urlTemplates,
    variableNames,
    recipients,
  }: {
    workspaceId: string;
    messageCampaignId: string;
    urlTemplates: string[];
    variableNames: string[];
    recipients: TrackingRecipient[];
  }): Promise<Map<string, string>> {
    const linkByUrl = new Map<string, { url: string; authoredUrl: string }>();

    for (const urlTemplate of urlTemplates) {
      const authoredUrl = this.restoreAuthoredUrl(urlTemplate, variableNames);

      for (const recipient of recipients) {
        const { url, isTrackable } = resolveTrackedLinkUrl({
          urlTemplate,
          replacements: recipient.replacements,
        });

        if (isTrackable) {
          linkByUrl.set(url, { url, authoredUrl });
        }
      }
    }

    if (linkByUrl.size === 0) {
      return new Map();
    }

    return this.messageCampaignLinkService.registerDestinations({
      workspaceId,
      messageCampaignId,
      links: [...linkByUrl.values()],
    });
  }

  private buildTrackingReplacements({
    baseUrl,
    recipient,
    urlTemplates,
    destinationIdByUrl,
  }: {
    baseUrl: string;
    recipient: TrackingRecipient;
    urlTemplates: string[];
    destinationIdByUrl: Map<string, string>;
  }): Record<string, string> {
    const replacements: Record<string, string> = {};

    urlTemplates.forEach((urlTemplate, index) => {
      const { url } = resolveTrackedLinkUrl({
        urlTemplate,
        replacements: recipient.replacements,
      });
      const destinationId = destinationIdByUrl.get(url);

      for (const messagePart of ['HTML', 'TEXT'] as const) {
        replacements[this.buildLinkTag({ messagePart, index })] = isDefined(
          destinationId,
        )
          ? this.buildTrackedUrl(baseUrl, {
              purpose: 'CLICK',
              deliveryId: recipient.deliveryId,
              destinationId,
              messagePart,
            })
          : url;
      }
    });

    return replacements;
  }

  private buildTrackedUrl(
    baseUrl: string,
    payload: CampaignTrackingTokenPayload,
  ): string {
    const token = this.campaignTrackingTokenService.sign(payload);

    return `${baseUrl}/${ApiPath.Emailing}/c/${token}`;
  }

  private buildLinkTag({
    messagePart,
    index,
  }: {
    messagePart: CampaignMessagePart;
    index: number;
  }): string {
    return `${CAMPAIGN_TRACKING_TAG_PREFIX_BY_MESSAGE_PART[messagePart]}_${index}`;
  }

  private restoreAuthoredUrl(
    urlTemplate: string,
    variableNames: string[],
  ): string {
    return urlTemplate.replace(
      CAMPAIGN_BATCH_VARIABLE_TAG_PATTERN,
      (tag: string, variableIndex: string) => {
        const variableName = variableNames[Number(variableIndex)];

        return isDefined(variableName) ? `{{${variableName}}}` : tag;
      },
    );
  }

  private canServeTrackedUrls(emailingDomain: EmailingDomainEntity): boolean {
    if (this.isLogDriver()) {
      return true;
    }

    return (
      emailingDomain.trackingHostnameStatus === ManagedHostnameStatus.ACTIVE &&
      isNonEmptyString(emailingDomain.trackingHostname)
    );
  }

  private async findTrackingBaseUrl({
    workspaceId,
    emailingDomainId,
  }: {
    workspaceId: string;
    emailingDomainId: string;
  }): Promise<string | undefined> {
    if (this.isLogDriver()) {
      return this.buildLocalBaseUrl(workspaceId);
    }

    const emailingDomain = await this.emailingDomainRepository.findOne(
      workspaceId,
      { where: { id: emailingDomainId } },
    );
    const trackingHostname = emailingDomain?.trackingHostname;

    if (!isNonEmptyString(trackingHostname)) {
      return undefined;
    }

    return `https://${trackingHostname}`;
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
      ? `${TRACKING_HOSTNAME_PREFIX}.${workspace.subdomain}.${baseUrl.hostname}`
      : `${TRACKING_HOSTNAME_PREFIX}.${baseUrl.hostname}`;

    return baseUrl.origin;
  }

  private isLogDriver(): boolean {
    return (
      this.twentyConfigService.get('EMAILING_DOMAIN_DRIVER') ===
      EmailingDomainDriver.LOG
    );
  }
}
