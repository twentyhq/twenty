import { CAMPAIGN_SENDING_REPUTATION_WINDOW_MS } from 'src/engine/core-modules/emailing-domain/constants/campaign-sending-reputation-window-ms.constant';
import { CAMPAIGN_SENDING_REPUTATION_CACHE_TTL_MS } from 'src/engine/core-modules/emailing-domain/constants/campaign-sending-reputation-cache-ttl-ms.constant';
import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { type CampaignSendingReputation } from 'src/engine/core-modules/emailing-domain/types/campaign-sending-reputation.type';
import { evaluateCampaignSendingReputation } from 'src/engine/core-modules/emailing-domain/utils/evaluate-campaign-sending-reputation.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { MessageCampaignStatus } from 'twenty-shared/types';

type CampaignCountTotalsRow = {
  sentCount: string | null;
  bouncedCount: string | null;
  complainedCount: string | null;
};

@Injectable()
export class CampaignSendingReputationService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectCacheStorage(CacheStorageNamespace.ModuleEmailing)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  private async getWorkspaceSendingReputation({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<CampaignSendingReputation> {
    const totals =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const campaignRepository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              MessageCampaignWorkspaceEntity,
              { shouldBypassPermissionChecks: true },
            );

          return campaignRepository
            .createQueryBuilder('messageCampaign')
            .select('SUM(messageCampaign.sentCount)', 'sentCount')
            .addSelect('SUM(messageCampaign.bouncedCount)', 'bouncedCount')
            .addSelect(
              'SUM(messageCampaign.complainedCount)',
              'complainedCount',
            )
            .where(
              '(messageCampaign.sentAt >= :windowStart OR messageCampaign.status = :sendingStatus)',
              {
                windowStart: new Date(
                  Date.now() - CAMPAIGN_SENDING_REPUTATION_WINDOW_MS,
                ),
                sendingStatus: MessageCampaignStatus.SENDING,
              },
            )
            .getRawOne<CampaignCountTotalsRow>();
        },
        buildSystemAuthContext(workspaceId),
      );

    return evaluateCampaignSendingReputation({
      attemptedCount: Number(totals?.sentCount ?? 0),
      bouncedCount: Number(totals?.bouncedCount ?? 0),
      complainedCount: Number(totals?.complainedCount ?? 0),
    });
  }

  async isSendingBlocked({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<boolean> {
    const cacheKey = `campaign-sending-blocked:${workspaceId}`;

    const cachedVerdict = await this.cacheStorageService.get<boolean>(cacheKey);

    if (isDefined(cachedVerdict)) {
      return cachedVerdict;
    }

    const { isSendingBlocked } = await this.getWorkspaceSendingReputation({
      workspaceId,
    });

    await this.cacheStorageService.set(
      cacheKey,
      isSendingBlocked,
      CAMPAIGN_SENDING_REPUTATION_CACHE_TTL_MS,
    );

    return isSendingBlocked;
  }

  async assertWorkspaceCanKeepSendingOrThrow({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<void> {
    const reputation = await this.getWorkspaceSendingReputation({
      workspaceId,
    });

    if (!reputation.isSendingBlocked) {
      return;
    }

    throw new EmailingDomainException(
      `Workspace ${workspaceId} exceeded its sending reputation thresholds: bounce rate ${reputation.bounceRate}, complaint rate ${reputation.complaintRate} over ${reputation.attemptedCount} attempted emails`,
      EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_SENDING_REPUTATION_TOO_LOW,
    );
  }
}
