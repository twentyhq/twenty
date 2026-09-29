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
import { appendHtmlFooter } from 'src/engine/core-modules/emailing-domain/utils/append-html-footer.util';
import { encodeCampaignOpenTrackingToken } from 'src/engine/core-modules/emailing-domain/utils/encode-campaign-open-tracking-token.util';
import { encodeCampaignTrackingToken } from 'src/engine/core-modules/emailing-domain/utils/encode-campaign-tracking-token.util';
import { applyReplacementTags } from 'src/engine/core-modules/emailing-domain/utils/apply-replacement-tags.util';
import { escapeHtml } from 'src/engine/core-modules/emailing-domain/utils/escape-html.util';
import { ShortLinkService } from 'src/engine/core-modules/short-link/services/short-link.service';
import { hashShortLink } from 'src/engine/core-modules/short-link/utils/hash-short-link.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { TRACKABLE_URL_PATTERN } from 'src/modules/emailing/constants/trackable-url-pattern.constant';
import { CAMPAIGN_BATCH_VARIABLE_TAG_PATTERN } from 'src/modules/emailing/constants/campaign-batch-variable-tag-pattern.constant';
import { CAMPAIGN_TRACKING_TAG_PREFIX_BY_MESSAGE_PART } from 'src/modules/emailing/constants/campaign-tracking-tag-prefix-by-message-part.constant';
import { CampaignEngagementEventService } from 'src/modules/emailing/services/campaign-engagement-event.service';
import { MessageSuppressionService } from 'src/modules/emailing/services/message-suppression.service';
import { collectTrackableLinkUrls } from 'src/modules/emailing/utils/collect-trackable-link-urls.util';
import { normalizeCampaignRecipientEmailAddress } from 'src/modules/emailing/utils/normalize-campaign-recipient-email-address.util';
import { replaceTrackableLinkUrls } from 'src/modules/emailing/utils/replace-trackable-link-urls.util';

const OPEN_PIXEL_TAG = 'o_h';

type CampaignMessagePart =
  keyof typeof CAMPAIGN_TRACKING_TAG_PREFIX_BY_MESSAGE_PART;

type TrackedCampaignBatch = {
  template: EmailingDomainEmailTemplate;
  replacementsByDeliveryId: Map<string, Record<string, string>>;
};

type TrackingRecipient = {
  deliveryId: string;
  email: string;
  replacements: Record<string, string>;
};

type PrepareBatchArgs = {
  workspaceId: string;
  emailingDomainId: string;
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
    private readonly twentyConfigService: TwentyConfigService,
    private readonly campaignEngagementEventService: CampaignEngagementEventService,
    private readonly messageSuppressionService: MessageSuppressionService,
  ) {}

  async prepareBatch({
    workspaceId,
    emailingDomainId,
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

    if (!this.campaignEngagementEventService.isAvailable()) {
      return untracked;
    }

    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    if (!isDefined(workspace)) {
      return untracked;
    }

    const isOpenTrackingEnabled = workspace.isCampaignOpenTrackingEnabled;
    const urlTemplates = workspace.isCampaignClickTrackingEnabled
      ? collectTrackableLinkUrls(html)
      : [];

    if (urlTemplates.length === 0 && !isOpenTrackingEnabled) {
      return untracked;
    }

    const baseUrl = await this.findTrackingBaseUrl({
      workspace,
      emailingDomainId,
    });

    if (!isDefined(baseUrl)) {
      return untracked;
    }

    const optedOutEmailAddresses =
      await this.messageSuppressionService.findTrackingOptedOutEmailAddresses({
        workspaceId,
        emailAddresses: recipients.map(({ email }) => email),
      });
    const isTracked = (recipient: TrackingRecipient) =>
      !optedOutEmailAddresses.has(
        normalizeCampaignRecipientEmailAddress(recipient.email),
      );

    const shortLinkIdByIdentity = await this.registerShortLinks({
      workspaceId,
      urlTemplates,
      variableNames,
      recipients: recipients.filter(isTracked),
    });

    return {
      template: this.buildTrackedTemplate({
        template,
        plainTextSourceHtml,
        urlTemplates,
        isOpenTrackingEnabled,
      }),
      replacementsByDeliveryId: new Map(
        recipients.map((recipient) => [
          recipient.deliveryId,
          {
            ...recipient.replacements,
            ...(isTracked(recipient)
              ? this.buildTrackingReplacements({
                  workspaceId,
                  baseUrl,
                  recipient,
                  urlTemplates,
                  variableNames,
                  shortLinkIdByIdentity,
                  isOpenTrackingEnabled,
                })
              : this.buildUntrackedReplacements({
                  recipient,
                  urlTemplates,
                  isOpenTrackingEnabled,
                })),
          },
        ]),
      ),
    };
  }

  private buildTrackedTemplate({
    template,
    plainTextSourceHtml,
    urlTemplates,
    isOpenTrackingEnabled,
  }: {
    template: EmailingDomainEmailTemplate;
    plainTextSourceHtml: string;
    urlTemplates: string[];
    isOpenTrackingEnabled: boolean;
  }): EmailingDomainEmailTemplate {
    const tagByUrl = (messagePart: CampaignMessagePart) =>
      new Map(
        urlTemplates.map((urlTemplate, index) => [
          urlTemplate,
          `{{${this.buildLinkTag({ messagePart, index })}}}`,
        ]),
      );

    const html = replaceTrackableLinkUrls({
      html: template.html ?? '',
      trackedUrlByUrl: tagByUrl('HTML'),
    });

    return {
      ...template,
      html: isOpenTrackingEnabled
        ? appendHtmlFooter(html, `{{${OPEN_PIXEL_TAG}}}`)
        : html,
      text: toPlainText(
        replaceTrackableLinkUrls({
          html: plainTextSourceHtml,
          trackedUrlByUrl: tagByUrl('TEXT'),
        }),
      ),
    };
  }

  private async registerShortLinks({
    workspaceId,
    urlTemplates,
    variableNames,
    recipients,
  }: {
    workspaceId: string;
    urlTemplates: string[];
    variableNames: string[];
    recipients: TrackingRecipient[];
  }): Promise<Map<string, string>> {
    const linkByIdentity = new Map<
      string,
      { authoredTemplateUrl: string; resolvedDestinationUrl: string }
    >();

    for (const urlTemplate of urlTemplates) {
      const authoredTemplateUrl = this.restoreAuthoredUrl({
        urlTemplate,
        variableNames,
      });

      for (const recipient of recipients) {
        const { url, isTrackable } = this.resolveLinkUrl({
          urlTemplate,
          replacements: recipient.replacements,
        });

        if (isTrackable) {
          const link = {
            authoredTemplateUrl,
            resolvedDestinationUrl: url,
          };

          linkByIdentity.set(hashShortLink(link), link);
        }
      }
    }

    if (linkByIdentity.size === 0) {
      return new Map();
    }

    return this.shortLinkService.registerLinks({
      workspaceId,
      links: [...linkByIdentity.values()],
    });
  }

  private buildTrackingReplacements({
    workspaceId,
    baseUrl,
    recipient,
    urlTemplates,
    variableNames,
    shortLinkIdByIdentity,
    isOpenTrackingEnabled,
  }: {
    workspaceId: string;
    baseUrl: string;
    recipient: TrackingRecipient;
    urlTemplates: string[];
    variableNames: string[];
    shortLinkIdByIdentity: Map<string, string>;
    isOpenTrackingEnabled: boolean;
  }): Record<string, string> {
    const replacements: Record<string, string> = {};

    if (isOpenTrackingEnabled) {
      const pixelUrl = `${baseUrl}/${ApiPath.Emailing}/o/${encodeCampaignOpenTrackingToken(
        { workspaceId, deliveryId: recipient.deliveryId },
      )}`;

      replacements[OPEN_PIXEL_TAG] =
        `<img src="${escapeHtml(pixelUrl)}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />`;
    }

    urlTemplates.forEach((urlTemplate, index) => {
      const authoredTemplateUrl = this.restoreAuthoredUrl({
        urlTemplate,
        variableNames,
      });
      const { url } = this.resolveLinkUrl({
        urlTemplate,
        replacements: recipient.replacements,
      });
      const shortLinkId = shortLinkIdByIdentity.get(
        hashShortLink({ authoredTemplateUrl, resolvedDestinationUrl: url }),
      );
      const linkUrl = isDefined(shortLinkId)
        ? `${baseUrl}/${ApiPath.Emailing}/c/${encodeCampaignTrackingToken({
            workspaceId,
            deliveryId: recipient.deliveryId,
            shortLinkId,
          })}`
        : url;

      replacements[this.buildLinkTag({ messagePart: 'HTML', index })] =
        escapeHtml(linkUrl);
      replacements[this.buildLinkTag({ messagePart: 'TEXT', index })] = linkUrl;
    });

    return replacements;
  }

  private buildUntrackedReplacements({
    recipient,
    urlTemplates,
    isOpenTrackingEnabled,
  }: {
    recipient: TrackingRecipient;
    urlTemplates: string[];
    isOpenTrackingEnabled: boolean;
  }): Record<string, string> {
    const replacements: Record<string, string> = {};

    if (isOpenTrackingEnabled) {
      replacements[OPEN_PIXEL_TAG] = '';
    }

    urlTemplates.forEach((urlTemplate, index) => {
      const { url } = this.resolveLinkUrl({
        urlTemplate,
        replacements: recipient.replacements,
      });

      replacements[this.buildLinkTag({ messagePart: 'HTML', index })] =
        escapeHtml(url);
      replacements[this.buildLinkTag({ messagePart: 'TEXT', index })] = url;
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

  private restoreAuthoredUrl({
    urlTemplate,
    variableNames,
  }: {
    urlTemplate: string;
    variableNames: string[];
  }): string {
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
      workspace.id,
      { where: { id: emailingDomainId } },
    );
    const unsubscribeHostname = emailingDomain?.unsubscribeHostname;

    if (!isNonEmptyString(unsubscribeHostname)) {
      return undefined;
    }

    return `https://${unsubscribeHostname}`;
  }
}
