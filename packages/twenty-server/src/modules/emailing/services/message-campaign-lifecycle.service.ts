import { Injectable } from '@nestjs/common';

import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-state.constant';
import { CAMPAIGN_FAILURE_REASON } from 'src/engine/core-modules/emailing-domain/constants/campaign-failure-reason.constant';
import { UNFINISHED_CAMPAIGN_DELIVERY_STATES } from 'src/engine/core-modules/emailing-domain/constants/unfinished-campaign-delivery-states.constant';
import { CAMPAIGN_SKIP_REASON } from 'src/engine/core-modules/emailing-domain/constants/campaign-skip-reason.constant';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

import { type FindOptionsWhere, In, LessThan } from 'typeorm';

import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageCampaignStatisticsService } from 'src/modules/emailing/services/message-campaign-statistics.service';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { computeCampaignTerminalStatus } from 'src/modules/emailing/utils/compute-campaign-terminal-status.util';
import { MessageCampaignStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type CampaignStatusTransition = {
  workspaceId: string;
  campaignId: string;
  from: MessageCampaignStatus;
  to: MessageCampaignStatus;
  roleId?: string;
};

@Injectable()
export class MessageCampaignLifecycleService {
  constructor(
    @InjectWorkspaceScopedRepository(CampaignDeliveryEntity)
    private readonly campaignDeliveryRepository: WorkspaceScopedRepository<CampaignDeliveryEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly userRoleService: UserRoleService,
    private readonly messageCampaignStatisticsService: MessageCampaignStatisticsService,
  ) {}

  async transitionCampaignStatus({
    workspaceId,
    campaignId,
    from,
    to,
    roleId,
  }: CampaignStatusTransition): Promise<boolean> {
    return this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const campaignRepository = this.workspaceOrmManager.getRepository(
          MessageCampaignWorkspaceEntity,
          isDefined(roleId)
            ? { unionOf: [roleId] }
            : { shouldBypassPermissionChecks: true },
        );

        const { affected } = await campaignRepository.update(
          { id: campaignId, status: from },
          { status: to },
        );

        return affected === 1;
      },
      isDefined(roleId) ? undefined : buildSystemAuthContext(workspaceId),
    );
  }

  async cancelCampaignOrThrow({
    workspaceId,
    userWorkspaceId,
    campaignId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    campaignId: string;
  }): Promise<{ campaignId: string; canceledMessageCount: number }> {
    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId,
      userWorkspaceId,
    });

    const canceled = await this.transitionCampaignStatus({
      workspaceId,
      campaignId,
      roleId,
      from: MessageCampaignStatus.SENDING,
      to: MessageCampaignStatus.CANCELED,
    });

    if (!canceled) {
      throw new EmailingDomainException(
        `Campaign ${campaignId} is not sending`,
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_CANCELABLE,
      );
    }

    const canceledMessageCount = await this.settleDeliveries({
      workspaceId,
      criteria: {
        campaignId,
        state: CAMPAIGN_DELIVERY_STATE.QUEUED,
      },
      update: {
        state: CAMPAIGN_DELIVERY_STATE.SKIPPED,
        skipReason: CAMPAIGN_SKIP_REASON.CAMPAIGN_CANCELED,
      },
    });

    await this.messageCampaignStatisticsService.scheduleRefresh({
      workspaceId,
      campaignId,
    });

    return { campaignId, canceledMessageCount };
  }

  async failDeliveriesWithExpiredClaims({
    workspaceId,
    campaignId,
  }: {
    workspaceId: string;
    campaignId: string;
  }): Promise<number> {
    return this.settleDeliveries({
      workspaceId,
      criteria: {
        campaignId,
        state: CAMPAIGN_DELIVERY_STATE.SENDING,
        claimExpiresAt: LessThan(new Date()),
      },
      update: {
        state: CAMPAIGN_DELIVERY_STATE.FAILED,
        failureReason: CAMPAIGN_FAILURE_REASON.CLAIM_EXPIRED,
        claimToken: null,
        claimExpiresAt: null,
      },
    });
  }

  private async settleDeliveries({
    workspaceId,
    criteria,
    update,
  }: {
    workspaceId: string;
    criteria: FindOptionsWhere<CampaignDeliveryEntity>;
    update: Partial<
      Pick<
        CampaignDeliveryEntity,
        | 'state'
        | 'skipReason'
        | 'failureReason'
        | 'claimToken'
        | 'claimExpiresAt'
      >
    >;
  }): Promise<number> {
    const { affected } = await this.campaignDeliveryRepository.update(
      workspaceId,
      criteria,
      update,
    );

    return affected ?? 0;
  }

  async finalizeCampaignIfComplete({
    workspaceId,
    campaignId,
  }: {
    workspaceId: string;
    campaignId: string;
  }): Promise<void> {
    // Every settled delivery calls this, so the check must not scale with the
    // campaign. Counting reads every unfinished row only to compare it against
    // zero; the probe stops at the first row the partial index yields.
    const hasUnfinishedDelivery =
      await this.campaignDeliveryRepository.existsBy(workspaceId, {
        campaignId,
        state: In(UNFINISHED_CAMPAIGN_DELIVERY_STATES),
      });

    if (hasUnfinishedDelivery) {
      return;
    }

    const counts =
      await this.messageCampaignStatisticsService.countDeliveriesByState({
        workspaceId,
        campaignId,
      });

    const terminalStatus = computeCampaignTerminalStatus(counts);

    if (!isDefined(terminalStatus)) {
      return;
    }

    const correctableStatuses =
      terminalStatus === MessageCampaignStatus.SENT
        ? [
            MessageCampaignStatus.SENDING,
            MessageCampaignStatus.SENT_WITH_ERRORS,
          ]
        : [MessageCampaignStatus.SENDING];

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const campaignRepository = this.workspaceOrmManager.getRepository(
        MessageCampaignWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      await campaignRepository.update(
        { id: campaignId, status: In(correctableStatuses) },
        { status: terminalStatus, sentAt: new Date() },
      );
    }, buildSystemAuthContext(workspaceId));

    await this.messageCampaignStatisticsService.persistCampaignCounts({
      workspaceId,
      campaignId,
      counts,
    });
  }
}
