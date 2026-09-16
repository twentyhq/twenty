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
import { applyReplacementTags } from 'src/engine/core-modules/emailing-domain/utils/apply-replacement-tags.util';
import { escapeHtml } from 'src/engine/core-modules/emailing-domain/utils/escape-html.util';
import { ShortLinkService } from 'src/engine/core-modules/short-link/services/short-link.service';
import { hashShortLink } from 'src/engine/core-modules/short-link/utils/hash-short-link.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { TRACKABLE_URL_PATTERN } from 'src/modules/emailing/constants/trackable-url-pattern.constant';
import { collectTrackableLinkUrls } from 'src/modules/emailing/utils/collect-trackable-link-urls.util';
import { replaceTrackableLinkUrls } from 'src/modules/emailing/utils/replace-trackable-link-urls.util';

const CAMPAIGN_BATCH_VARIABLE_TAG_PATTERN = /\{\{v_[htu]_(\d+)\}\}/g;

type CampaignMessagePart = 'HTML' | 'TEXT';

const CAMPAIGN_TRACKING_TAG_PREFIX_BY_MESSAGE_PART: Record<
  CampaignMessagePart,
  string
> = {
  HTML: 'c_h',
  TEXT: 'c_t',
};

type TrackedCampaignBatch = {
  template: EmailingDomainEmailTemplate;
  replacementsByDeliveryId: Map<string, Record<string, string>>;
};

type TrackingRecipient = {
  deliveryId: string;
  replacements: Record<string, string>;
};

type PrepareBatchArgs = {
  workspaceId: string;
  emailingDomainId: string;
  messageCampaignId: string;
  template: EmailingDomainEmailTemplate;
  plainTextSourceHtml: string;
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
    plainTextSourceHtml,
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

    if (!isNonEmptyString(html.trim())) {
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

    const shortLinkIdByIdentity = await this.registerShortLinks({
      workspaceId,
      messageCampaignId,
      urlTemplates,
      variableNames,
      recipients,
    });

    return {
      template: this.buildTrackedTemplate({
        template,
        plainTextSourceHtml,
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
              variableNames,
              shortLinkIdByIdentity,
            }),
          },
        ]),
      ),
    };
  }

  private buildTrackedTemplate({
    template,
    plainTextSourceHtml,
    urlTemplates,
  }: {
    template: EmailingDomainEmailTemplate;
    plainTextSourceHtml: string;
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
        replaceTrackableLinkUrls(plainTextSourceHtml, tagByUrl('TEXT')),
      ),
    };
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
    const linkByIdentity = new Map<
      string,
      { url: string; authoredUrl: string }
    >();

    for (const urlTemplate of urlTemplates) {
      const authoredUrl = this.restoreAuthoredUrl(urlTemplate, variableNames);

      for (const recipient of recipients) {
        const { url, isTrackable } = this.resolveLinkUrl({
          urlTemplate,
          replacements: recipient.replacements,
        });

        if (isTrackable) {
          const link = { url, authoredUrl };

          linkByIdentity.set(hashShortLink(link), link);
        }
      }
    }

    if (linkByIdentity.size === 0) {
      return new Map();
    }

    return this.shortLinkService.registerCampaignLinks({
      workspaceId,
      messageCampaignId,
      links: [...linkByIdentity.values()],
    });
  }

  private buildTrackingReplacements({
    baseUrl,
    recipient,
    urlTemplates,
    variableNames,
    shortLinkIdByIdentity,
  }: {
    baseUrl: string;
    recipient: TrackingRecipient;
    urlTemplates: string[];
    variableNames: string[];
    shortLinkIdByIdentity: Map<string, string>;
  }): Record<string, string> {
    const replacements: Record<string, string> = {};

    urlTemplates.forEach((urlTemplate, index) => {
      const authoredUrl = this.restoreAuthoredUrl(urlTemplate, variableNames);
      const { url } = this.resolveLinkUrl({
        urlTemplate,
        replacements: recipient.replacements,
      });
      const shortLinkId = shortLinkIdByIdentity.get(
        hashShortLink({ url, authoredUrl }),
      );
      const linkUrl = isDefined(shortLinkId)
        ? `${baseUrl}/${ApiPath.Emailing}/c/${this.campaignTrackingTokenService.sign(
            { purpose: 'CLICK', deliveryId: recipient.deliveryId, shortLinkId },
          )}`
        : url;

      replacements[this.buildLinkTag({ messagePart: 'HTML', index })] =
        escapeHtml(linkUrl);
      replacements[this.buildLinkTag({ messagePart: 'TEXT', index })] = linkUrl;
    });

    return replacements;
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

  private resolveLinkUrl({
    urlTemplate,
    replacements,
  }: {
    urlTemplate: string;
    replacements: Record<string, string>;
  }): { url: string; isTrackable: boolean } {
    const url = applyReplacementTags(urlTemplate, replacements);

    return {
      url,
      isTrackable: TRACKABLE_URL_PATTERN.test(url) && URL.canParse(url),
    };
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
    workspaceId,
    emailingDomainId,
  }: {
    workspaceId: string;
    emailingDomainId: string;
  }): Promise<string | undefined> {
    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    if (!workspace?.isCampaignClickTrackingEnabled) {
      return undefined;
    }

    if (
      this.twentyConfigService.get('EMAILING_DOMAIN_DRIVER') ===
      EmailingDomainDriver.LOG
    ) {
      if (!isNonEmptyString(workspace.subdomain)) {
        return undefined;
      }

      return buildLogDriverUnsubscribeBaseUrl({
        serverUrl: this.twentyConfigService.get('SERVER_URL'),
        isMultiWorkspaceEnabled: this.twentyConfigService.get(
          'IS_MULTIWORKSPACE_ENABLED',
        ),
        subdomain: workspace.subdomain,
      });
    }

    const emailingDomain = await this.emailingDomainRepository.findOne(
      workspaceId,
      { where: { id: emailingDomainId } },
    );
    const unsubscribeHostname = emailingDomain?.unsubscribeHostname;

    if (!isNonEmptyString(unsubscribeHostname)) {
      return undefined;
    }

    return `https://${unsubscribeHostname}`;
  }
}
