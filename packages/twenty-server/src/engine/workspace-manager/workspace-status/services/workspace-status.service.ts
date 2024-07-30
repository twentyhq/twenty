import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Any, Repository } from 'typeorm';

import {
  BillingSubscription,
  SubscriptionStatus,
} from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';

@Injectable()
export class WorkspaceStatusService {
  constructor(
    private readonly environmentService: EnvironmentService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(BillingSubscription, 'core')
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  async getActiveWorkspaceIds(): Promise<string[]> {
    const workspaces = await this.workspaceRepository.find();
    const workspaceIds = workspaces.map((workspace) => workspace.id);

    if (!this.environmentService.get('IS_BILLING_ENABLED')) {
      return workspaceIds;
    }

    const billingSubscriptionForWorkspaces =
      await this.billingSubscriptionRepository.find({
        where: {
          workspaceId: Any(workspaceIds),
          status: Any([
            SubscriptionStatus.PastDue,
            SubscriptionStatus.Active,
            SubscriptionStatus.Trialing,
          ]),
        },
      });

    const workspaceIdsWithActiveSubscription =
      billingSubscriptionForWorkspaces.map(
        (billingSubscription) => billingSubscription.workspaceId,
      );

    const freeAccessEnabledFeatureFlagForWorkspace =
      await this.featureFlagRepository.find({
        where: {
          workspaceId: Any(workspaceIds),
          key: FeatureFlagKey.IsFreeAccessEnabled,
          value: true,
        },
      });

    const workspaceIdsWithFreeAccessEnabled =
      freeAccessEnabledFeatureFlagForWorkspace.map(
        (featureFlag) => featureFlag.workspaceId,
      );

    return workspaceIds.filter(
      (workspaceId) =>
        workspaceIdsWithActiveSubscription.includes(workspaceId) ||
        workspaceIdsWithFreeAccessEnabled.includes(workspaceId),
    );
  }
}
