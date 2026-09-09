import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { In } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { type MessageCampaignEngagementBucketDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-campaign-engagement-bucket.dto';
import { type MessageCampaignEngagementLinkDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-campaign-engagement-link.dto';
import { type MessageCampaignEngagementRecipientDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-campaign-engagement-recipient.dto';
import { type MessageCampaignEngagementDTO } from 'src/engine/core-modules/emailing-domain/dtos/message-campaign-engagement.dto';
import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { CampaignEngagementActivityFilter } from 'src/modules/emailing/constants/campaign-engagement-activity-filter.constant';
import {
  type CampaignEngagementBucket,
  CampaignEngagementEventService,
} from 'src/modules/emailing/services/campaign-engagement-event.service';
import { MessageCampaignLinkService } from 'src/modules/emailing/services/message-campaign-link.service';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';

const HOURLY_SERIES_MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const RECIPIENTS_LIMIT = 50;

type ReportedCampaign = Pick<
  MessageCampaignWorkspaceEntity,
  'id' | 'sentAt' | 'isClickTrackingEnabled' | 'engagementCalculatedAt'
>;

@Injectable()
export class CampaignEngagementReportService {
  constructor(
    @InjectWorkspaceScopedRepository(CampaignDeliveryEntity)
    private readonly campaignDeliveryRepository: WorkspaceScopedRepository<CampaignDeliveryEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly userRoleService: UserRoleService,
    private readonly campaignEngagementEventService: CampaignEngagementEventService,
    private readonly messageCampaignLinkService: MessageCampaignLinkService,
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
    const campaign = await this.findReadableCampaignOrThrow({
      workspaceId,
      userWorkspaceId,
      messageCampaignId,
    });

    const isAvailable = this.campaignEngagementEventService.isAvailable();

    const emptyReport: MessageCampaignEngagementDTO = {
      isAvailable,
      isClickTrackingEnabled: campaign.isClickTrackingEnabled,
      calculatedAt: campaign.engagementCalculatedAt,
      totalClicks: 0,
      uniqueClickers: 0,
      series: [],
      links: [],
      recipients: [],
    };

    if (!isAvailable || !campaign.isClickTrackingEnabled) {
      return emptyReport;
    }

    const scope = { workspaceId, messageCampaignId, activityFilter };
    const bucket = this.resolveBucket(campaign.sentAt);

    const [totals, series, clicksByDestination, engagedDeliveries] =
      await Promise.all([
        this.campaignEngagementEventService.countEngagement(scope),
        this.campaignEngagementEventService.findSeries({ ...scope, bucket }),
        this.campaignEngagementEventService.findClicksByDestination(scope),
        this.campaignEngagementEventService.findEngagedDeliveries({
          ...scope,
          limit: RECIPIENTS_LIMIT,
        }),
      ]);

    return {
      ...emptyReport,
      totalClicks: totals.totalClicks,
      uniqueClickers: totals.uniqueClickers,
      series: this.fillSeries({ series, bucket, sentAt: campaign.sentAt }),
      links: await this.rollUpLinksByAuthoredUrl({
        workspaceId,
        messageCampaignId,
        clicksByDestination,
      }),
      recipients: await this.attachRecipients({
        workspaceId,
        messageCampaignId,
        engagedDeliveries,
      }),
    };
  }

  private async findReadableCampaignOrThrow({
    workspaceId,
    userWorkspaceId,
    messageCampaignId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    messageCampaignId: string;
  }): Promise<ReportedCampaign> {
    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId,
      userWorkspaceId,
    });

    const campaign = await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const campaignRepository = this.workspaceOrmManager.getRepository(
          MessageCampaignWorkspaceEntity,
          { unionOf: [roleId] },
        );

        return campaignRepository.findOne({
          where: { id: messageCampaignId },
          select: {
            id: true,
            sentAt: true,
            isClickTrackingEnabled: true,
            engagementCalculatedAt: true,
          },
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

  private resolveBucket(sentAt: Date | null): CampaignEngagementBucket {
    const ageMs = Date.now() - (sentAt?.getTime() ?? Date.now());

    return ageMs <= HOURLY_SERIES_MAX_AGE_MS ? 'hour' : 'day';
  }

  // Empty buckets are filled so the chart shows silence as a flat line rather
  // than joining two distant points.
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

  // Each recipient resolves one authored link to exactly one destination, so
  // summing unique clickers across a link's destinations stays exact.
  private async rollUpLinksByAuthoredUrl({
    workspaceId,
    messageCampaignId,
    clicksByDestination,
  }: {
    workspaceId: string;
    messageCampaignId: string;
    clicksByDestination: {
      destinationId: string;
      uniqueClickers: number;
      totalClicks: number;
    }[];
  }): Promise<MessageCampaignEngagementLinkDTO[]> {
    const links = await this.messageCampaignLinkService.findCampaignLinks({
      workspaceId,
      messageCampaignId,
    });
    const authoredUrlByDestinationId = new Map(
      links.map((link) => [link.id, link.authoredUrl]),
    );
    const totalsByAuthoredUrl = new Map<
      string,
      MessageCampaignEngagementLinkDTO
    >();

    for (const clicks of clicksByDestination) {
      const authoredUrl = authoredUrlByDestinationId.get(clicks.destinationId);

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
    messageCampaignId,
    engagedDeliveries,
  }: {
    workspaceId: string;
    messageCampaignId: string;
    engagedDeliveries: {
      deliveryId: string;
      firstClickedAt: Date | null;
      lastEngagedAt: Date;
    }[];
  }): Promise<MessageCampaignEngagementRecipientDTO[]> {
    if (engagedDeliveries.length === 0) {
      return [];
    }

    const deliveries = await this.campaignDeliveryRepository.find(workspaceId, {
      where: {
        id: In(engagedDeliveries.map((delivery) => delivery.deliveryId)),
        campaignId: messageCampaignId,
      },
      select: { id: true, personId: true },
    });
    const personIdByDeliveryId = new Map(
      deliveries.map((delivery) => [delivery.id, delivery.personId]),
    );

    return engagedDeliveries.flatMap((engaged) => {
      const personId = personIdByDeliveryId.get(engaged.deliveryId);

      return isDefined(personId) ? [{ ...engaged, personId }] : [];
    });
  }
}
