/* @license Enterprise */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { toPlainText } from 'twenty-emails';
import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildLogDriverUnsubscribeBaseUrl } from 'src/engine/core-modules/emailing-domain/drivers/log/utils/build-log-driver-unsubscribe-base-url.util';
import { EmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-driver.type';
import { type EmailingDomainEmailTemplate } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-email-template.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { CampaignTrackingTokenService } from 'src/engine/core-modules/emailing-domain/services/campaign-tracking-token.service';
import { type CampaignMessagePart } from 'src/engine/core-modules/emailing-domain/types/campaign-message-part.type';
import { type CampaignTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/campaign-tracking-token-payload.type';
import { escapeHtml } from 'src/engine/core-modules/emailing-domain/utils/escape-html.util';
import { ShortLinkService } from 'src/engine/core-modules/short-link/services/short-link.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { CAMPAIGN_BATCH_VARIABLE_TAG_PATTERN } from 'src/modules/emailing/constants/campaign-batch-variable-tag-pattern.constant';
import { CAMPAIGN_OPEN_PIXEL_TAG } from 'src/modules/emailing/constants/campaign-open-pixel-tag.constant';
import { CAMPAIGN_TRACKING_TAG_PREFIX_BY_MESSAGE_PART } from 'src/modules/emailing/constants/campaign-tracking-tag.constant';
import { type TrackedCampaignBatch } from 'src/modules/emailing/types/tracked-campaign-batch.type';
import { collectTrackableLinkUrls } from 'src/modules/emailing/utils/collect-trackable-link-urls.util';
import { replaceTrackableLinkUrls } from 'src/modules/emailing/utils/replace-trackable-link-urls.util';
import { resolveTrackedLinkUrl } from 'src/modules/emailing/utils/resolve-tracked-link-url.util';

type TrackingRecipient = {
  deliveryId: string;
  replacements: Record<string, string>;
};

const OPEN_PIXEL_HTML = `<img src="{{${CAMPAIGN_OPEN_PIXEL_TAG}}}" width="1" height="1" alt="" style="display:none;width:1px;height:1px;border:0" />`;

type PrepareBatchArgs = {
  workspaceId: string;
  emailingDomainId: string;
  messageCampaignId: string;
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
    private readonly shortLinkService: ShortLinkService,
    private readonly campaignTrackingTokenService: CampaignTrackingTokenService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async prepareBatch({
    workspaceId,
    emailingDomainId,
    messageCampaignId,
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

    if (html.trim() === '') {
      return untracked;
    }

    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    if (!isDefined(workspace)) {
      return untracked;
    }

    const { isCampaignClickTrackingEnabled, isCampaignOpenTrackingEnabled } = workspace;

    const urlTemplates = isCampaignClickTrackingEnabled
      ? collectTrackableLinkUrls(html)
      : [];

    if (urlTemplates.length === 0 && !isCampaignOpenTrackingEnabled) {
      return untracked;
    }

    const baseUrl = await this.findTrackingBaseUrl({
      workspace,
      emailingDomainId,
    });

    if (!isDefined(baseUrl)) {
      return untracked;
    }

    const shortLinkIdByUrl = await this.registerShortLinks({
      workspaceId,
      messageCampaignId,
      urlTemplates,
      variableNames,
      recipients,
    });

    return {
      template: this.buildTrackedTemplate({
        template,
        textPartHtml,
        urlTemplates,
        withOpenPixel: isCampaignOpenTrackingEnabled,
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
              shortLinkIdByUrl,
              withOpenPixel: isCampaignOpenTrackingEnabled,
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
    withOpenPixel,
  }: {
    template: EmailingDomainEmailTemplate;
    textPartHtml: string;
    urlTemplates: string[];
    withOpenPixel: boolean;
  }): EmailingDomainEmailTemplate {
    const tagByUrl = (messagePart: CampaignMessagePart) =>
      new Map(
        urlTemplates.map((urlTemplate, index) => [
          urlTemplate,
          `{{${this.buildLinkTag({ messagePart, index })}}}`,
        ]),
      );

    const html = replaceTrackableLinkUrls(
      template.html ?? '',
      tagByUrl('HTML'),
    );

    return {
      ...template,
      html: withOpenPixel ? this.appendOpenPixel(html) : html,
      text: toPlainText(
        replaceTrackableLinkUrls(textPartHtml, tagByUrl('TEXT')),
      ),
    };
  }

  private appendOpenPixel(html: string): string {
    const bodyEndIndex = html.lastIndexOf('</body>');

    if (bodyEndIndex === -1) {
      return `${html}${OPEN_PIXEL_HTML}`;
    }

    return `${html.slice(0, bodyEndIndex)}${OPEN_PIXEL_HTML}${html.slice(bodyEndIndex)}`;
  }

  private async registerShortLinks({
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
    if (urlTemplates.length === 0) {
      return new Map();
    }

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

    return this.shortLinkService.registerCampaignLinks({
      workspaceId,
      messageCampaignId,
      links: [...linkByUrl.values()],
    });
  }

  private buildTrackingReplacements({
    baseUrl,
    recipient,
    urlTemplates,
    shortLinkIdByUrl,
    withOpenPixel,
  }: {
    baseUrl: string;
    recipient: TrackingRecipient;
    urlTemplates: string[];
    shortLinkIdByUrl: Map<string, string>;
    withOpenPixel: boolean;
  }): Record<string, string> {
    const replacements: Record<string, string> = {};

    urlTemplates.forEach((urlTemplate, index) => {
      const { url } = resolveTrackedLinkUrl({
        urlTemplate,
        replacements: recipient.replacements,
      });
      const shortLinkId = shortLinkIdByUrl.get(url);
      const linkUrl = isDefined(shortLinkId)
        ? this.buildTrackedUrl(baseUrl, {
            purpose: 'CLICK',
            deliveryId: recipient.deliveryId,
            shortLinkId,
          })
        : url;

      replacements[this.buildLinkTag({ messagePart: 'HTML', index })] =
        escapeHtml(linkUrl);
      replacements[this.buildLinkTag({ messagePart: 'TEXT', index })] = linkUrl;
    });

    if (withOpenPixel) {
      replacements[CAMPAIGN_OPEN_PIXEL_TAG] = this.buildTrackedUrl(baseUrl, {
        purpose: 'OPEN',
        deliveryId: recipient.deliveryId,
      });
    }

    return replacements;
  }

  private buildTrackedUrl(
    baseUrl: string,
    payload: CampaignTrackingTokenPayload,
  ): string {
    const token = this.campaignTrackingTokenService.sign(payload);
    const routeSegment = payload.purpose === 'CLICK' ? 'c' : 'o';

    return `${baseUrl}/${ApiPath.Emailing}/${routeSegment}/${token}`;
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

  private async findTrackingBaseUrl({
    workspace,
    emailingDomainId,
  }: {
    workspace: WorkspaceEntity;
    emailingDomainId: string;
  }): Promise<string | undefined> {
    if (this.isLogDriver()) {
      return isNonEmptyString(workspace.subdomain)
        ? buildLogDriverUnsubscribeBaseUrl({
            serverUrl: this.twentyConfigService.get('SERVER_URL'),
            isMultiWorkspaceEnabled: this.twentyConfigService.get(
              'IS_MULTIWORKSPACE_ENABLED',
            ),
            subdomain: workspace.subdomain,
          })
        : undefined;
    }

    const emailingDomain = await this.emailingDomainRepository.findOne(
      workspace.id,
      { where: { id: emailingDomainId } },
    );
    const unsubscribeHostname = emailingDomain?.unsubscribeHostname;

    return isNonEmptyString(unsubscribeHostname)
      ? `https://${unsubscribeHostname}`
      : undefined;
  }

  private isLogDriver(): boolean {
    return (
      this.twentyConfigService.get('EMAILING_DOMAIN_DRIVER') ===
      EmailingDomainDriver.LOG
    );
  }
}
