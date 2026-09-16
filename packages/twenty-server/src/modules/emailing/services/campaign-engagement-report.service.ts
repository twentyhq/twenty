import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { In } from 'typeorm';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { type MessageCampaignEngagementBucketDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-campaign-engagement-bucket.dto';
import { type MessageCampaignEngagementLinkDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-campaign-engagement-link.dto';
import { type MessageCampaignEngagementRecipientDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-campaign-engagement-recipient.dto';
import { type MessageCampaignEngagementDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-campaign-engagement.dto';
import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { ShortLinkService } from 'src/engine/core-modules/short-link/services/short-link.service';
import { type ShortLinkEntity } from 'src/engine/core-modules/short-link/short-link.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { CampaignEngagementActivityFilter } from 'src/modules/emailing/constants/campaign-engagement-activity-filter.constant';
import { CampaignEngagementEventService } from 'src/modules/emailing/services/campaign-engagement-event.service';
import { ObjectRecordPermissionService } from 'src/modules/emailing/services/object-record-permission.service';
import { PersonAccessService } from 'src/modules/emailing/services/person-access.service';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { type CampaignEngagementBucket } from 'src/modules/emailing/types/campaign-engagement-bucket.type';

const HOURLY_SERIES_MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const RECIPIENTS_LIMIT = 50;

type ReportedCampaign = Pick<MessageCampaignWorkspaceEntity, 'id' | 'sentAt'>;

@Injectable()
export class CampaignEngagementReportService {
  constructor(
    @InjectWorkspaceScopedRepository(CampaignDeliveryEntity)
    private readonly campaignDeliveryRepository: WorkspaceScopedRepository<CampaignDeliveryEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly userRoleService: UserRoleService,
    private readonly campaignEngagementEventService: CampaignEngagementEventService,
    private readonly shortLinkService: ShortLinkService,
    private readonly objectRecordPermissionService: ObjectRecordPermissionService,
    private readonly personAccessService: PersonAccessService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  async getReport({
    workspaceId,
    userWorkspaceId,
    messageCampaignId,
    activityFilter,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    messageCampaignId: string;
    activityFilter: CampaignEngagementActivityFilter;
  }): Promise<MessageCampaignEngagementDTO> {
    await this.objectRecordPermissionService.assertObjectRecordPermissions({
      workspaceId,
      userWorkspaceId,
      objectUniversalIdentifiers: [
        STANDARD_OBJECTS.messageCampaign.universalIdentifier,
      ],
      requiredPermissions: ['canReadObjectRecords'],
    });

    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId,
      userWorkspaceId,
    });

    const campaign = await this.findReadableCampaignOrThrow({
      roleId,
      messageCampaignId,
    });

    const isAvailable = this.campaignEngagementEventService.isAvailable();

    const emptyReport: MessageCampaignEngagementDTO = {
      isAvailable,
      totalClicks: 0,
      uniqueClickers: 0,
      series: [],
      links: [],
      recipients: [],
    };

    if (!isAvailable) {
      return emptyReport;
    }

    const scope = { workspaceId, messageCampaignId, activityFilter };
    const campaignAgeMs =
      Date.now() - (campaign.sentAt?.getTime() ?? Date.now());
    const bucket: CampaignEngagementBucket =
      campaignAgeMs <= HOURLY_SERIES_MAX_AGE_MS ? 'hour' : 'day';

    const aggregates = await Promise.all([
      this.campaignEngagementEventService.countClicks(scope),
      this.campaignEngagementEventService.findClickSeries({ ...scope, bucket }),
      this.campaignEngagementEventService.findClicksByShortLink(scope),
      this.campaignEngagementEventService.findClickedDeliveries({
        ...scope,
        limit: RECIPIENTS_LIMIT,
      }),
    ]).catch((error) => {
      this.exceptionHandlerService.captureExceptions([error], {
        additionalData: { workspaceId, messageCampaignId },
      });

      return undefined;
    });

    if (!isDefined(aggregates)) {
      return { ...emptyReport, isAvailable: false };
    }

    const [totals, series, clicksByShortLink, clickedDeliveries] = aggregates;

    return {
      ...emptyReport,
      totalClicks: totals.totalClicks,
      uniqueClickers: totals.uniqueClickers,
      series: this.fillSeries({ series, bucket, sentAt: campaign.sentAt }),
      links: this.rollUpLinksByAuthoredUrl({
        shortLinks: await this.shortLinkService.findByIds({
          workspaceId,
          shortLinkIds: clicksByShortLink.map((clicks) => clicks.shortLinkId),
        }),
        clicksByShortLink,
      }),
      recipients: await this.attachRecipients({
        workspaceId,
        roleId,
        messageCampaignId,
        clickedDeliveries,
      }),
    };
  }

  private async findReadableCampaignOrThrow({
    roleId,
    messageCampaignId,
  }: {
    roleId: string;
    messageCampaignId: string;
  }): Promise<ReportedCampaign> {
    const campaign = await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const campaignRepository = this.workspaceOrmManager.getRepository(
          MessageCampaignWorkspaceEntity,
          { unionOf: [roleId] },
        );

        return campaignRepository.findOne({
          where: { id: messageCampaignId },
          select: { id: true, sentAt: true },
        });
      },
    );

    if (!isDefined(campaign)) {
      throw new EmailingDomainException(
        `Campaign ${messageCampaignId} not found`,
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_FOUND,
        { userFriendlyMessage: msg`Campaign not found.` },
      );
    }

    return campaign;
  }

  private fillSeries({
    series,
    bucket,
    sentAt,
  }: {
    series: MessageCampaignEngagementBucketDTO[];
    bucket: CampaignEngagementBucket;
    sentAt: Date | null;
  }): MessageCampaignEngagementBucketDTO[] {
    const bucketMs = bucket === 'hour' ? HOUR_MS : DAY_MS;
    const firstBucketMs = Math.min(
      ...series.map((point) => point.bucketStart.getTime()),
      Math.floor((sentAt ?? new Date()).getTime() / bucketMs) * bucketMs,
    );
    const lastBucketMs = Math.floor(Date.now() / bucketMs) * bucketMs;
    const countsByBucketMs = new Map(
      series.map((point) => [point.bucketStart.getTime(), point]),
    );
    const filled: MessageCampaignEngagementBucketDTO[] = [];

    for (
      let bucketStartMs = firstBucketMs;
      bucketStartMs <= lastBucketMs;
      bucketStartMs += bucketMs
    ) {
      filled.push(
        countsByBucketMs.get(bucketStartMs) ?? {
          bucketStart: new Date(bucketStartMs),
          clicks: 0,
        },
      );
    }

    return filled;
  }

  private rollUpLinksByAuthoredUrl({
    shortLinks,
    clicksByShortLink,
  }: {
    shortLinks: ShortLinkEntity[];
    clicksByShortLink: {
      shortLinkId: string;
      uniqueClickers: number;
      totalClicks: number;
    }[];
  }): MessageCampaignEngagementLinkDTO[] {
    const authoredUrlByShortLinkId = new Map(
      shortLinks.map((shortLink) => [shortLink.id, shortLink.authoredUrl]),
    );
    const totalsByAuthoredUrl = new Map<
      string,
      MessageCampaignEngagementLinkDTO
    >();

    for (const clicks of clicksByShortLink) {
      const authoredUrl = authoredUrlByShortLinkId.get(clicks.shortLinkId);

      if (!isDefined(authoredUrl)) {
        continue;
      }

      const current = totalsByAuthoredUrl.get(authoredUrl) ?? {
        authoredUrl,
        uniqueClickers: 0,
        totalClicks: 0,
      };

      totalsByAuthoredUrl.set(authoredUrl, {
        authoredUrl,
        uniqueClickers: current.uniqueClickers + clicks.uniqueClickers,
        totalClicks: current.totalClicks + clicks.totalClicks,
      });
    }

    return [...totalsByAuthoredUrl.values()].sort(
      (first, second) => second.uniqueClickers - first.uniqueClickers,
    );
  }

  private async attachRecipients({
    workspaceId,
    roleId,
    messageCampaignId,
    clickedDeliveries,
  }: {
    workspaceId: string;
    roleId: string;
    messageCampaignId: string;
    clickedDeliveries: {
      deliveryId: string;
      firstClickedAt: Date | null;
      lastClickedAt: Date;
    }[];
  }): Promise<MessageCampaignEngagementRecipientDTO[]> {
    if (clickedDeliveries.length === 0) {
      return [];
    }

    const deliveries = await this.campaignDeliveryRepository.find(workspaceId, {
      where: {
        id: In(clickedDeliveries.map((delivery) => delivery.deliveryId)),
        campaignId: messageCampaignId,
      },
      select: { id: true, personId: true },
    });
    const personIdByDeliveryId = new Map(
      deliveries.map((delivery) => [delivery.id, delivery.personId]),
    );

    const readablePersonIds =
      await this.personAccessService.findReadablePersonIds({
        roleId,
        personIds: [...personIdByDeliveryId.values()].filter(isDefined),
      });

    return clickedDeliveries.flatMap((clickedDelivery) => {
      const personId = personIdByDeliveryId.get(clickedDelivery.deliveryId);

      return isDefined(personId) && readablePersonIds.has(personId)
        ? [{ ...clickedDelivery, personId }]
        : [];
    });
  }
}
