import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { In } from 'typeorm';
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
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { CampaignEngagementActivityFilter } from 'src/modules/emailing/constants/campaign-engagement-activity-filter.constant';
import { CampaignEngagementEventService } from 'src/modules/emailing/services/campaign-engagement-event.service';
import { MessageCampaignAccessService } from 'src/modules/emailing/services/message-campaign-access.service';
import { MessageCampaignLinkService } from 'src/modules/emailing/services/message-campaign-link.service';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { type CampaignEngagementBucket } from 'src/modules/emailing/types/campaign-engagement-bucket.type';

const HOURLY_SERIES_MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const RECIPIENTS_LIMIT = 50;

type ReportedCampaign = Pick<
  MessageCampaignWorkspaceEntity,
  | 'id'
  | 'sentAt'
  | 'isClickTrackingEnabled'
  | 'isOpenTrackingEnabled'
  | 'engagementCalculatedAt'
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
    private readonly messageCampaignAccessService: MessageCampaignAccessService,
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
    await this.messageCampaignAccessService.assertCanReadCampaigns({
      workspaceId,
      userWorkspaceId,
    });

    const campaign = await this.findReadableCampaignOrThrow({
      workspaceId,
      userWorkspaceId,
      messageCampaignId,
    });

    const isAvailable = this.campaignEngagementEventService.isAvailable();

    const isTracked =
      campaign.isClickTrackingEnabled || campaign.isOpenTrackingEnabled;

    const emptyReport: MessageCampaignEngagementDTO = {
      isAvailable,
      isClickTrackingEnabled: campaign.isClickTrackingEnabled,
      isOpenTrackingEnabled: campaign.isOpenTrackingEnabled,
      calculatedAt: campaign.engagementCalculatedAt,
      totalOpens: 0,
      totalClicks: 0,
      uniqueOpeners: 0,
      uniqueClickers: 0,
      series: [],
      links: [],
      recipients: [],
    };

    if (!isAvailable || !isTracked) {
      return emptyReport;
    }

    const scope = { workspaceId, messageCampaignId, activityFilter };
    const bucket = this.resolveBucket(campaign.sentAt);

    const aggregates = await Promise.all([
      this.campaignEngagementEventService.countEngagement(scope),
      this.campaignEngagementEventService.findSeries({ ...scope, bucket }),
      this.campaignEngagementEventService.findClicksByDestination(scope),
      this.campaignEngagementEventService.findEngagedDeliveries({
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

    const [totals, series, clicksByDestination, engagedDeliveries] = aggregates;

    return {
      ...emptyReport,
      totalOpens: totals.totalOpens,
      totalClicks: totals.totalClicks,
      uniqueOpeners: campaign.isOpenTrackingEnabled ? totals.uniqueOpeners : 0,
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
            isOpenTrackingEnabled: true,
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
          opens: 0,
          clicks: 0,
        },
      );
    }

    return filled;
  }

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
      firstOpenedAt: Date | null;
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
