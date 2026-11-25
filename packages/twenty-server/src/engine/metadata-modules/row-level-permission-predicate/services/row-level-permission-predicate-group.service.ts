/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { fromFlatRowLevelPermissionPredicateGroupToDto } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-flat-row-level-permission-predicate-group-to-dto.util';
import { RowLevelPermissionPredicateGroupDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate-group.dto';

@Injectable()
export class RowLevelPermissionPredicateGroupService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly billingService: BillingService,
    private readonly enterprisePlanService: EnterprisePlanService,
  ) {}

  async findByWorkspaceId(
    workspaceId: string,
  ): Promise<RowLevelPermissionPredicateGroupDTO[]> {
    const hasRowLevelPermissionFeature =
      await this.hasRowLevelPermissionFeature(workspaceId);

    if (!hasRowLevelPermissionFeature) {
      return [];
    }

    const { flatRowLevelPermissionPredicateGroupMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRowLevelPermissionPredicateGroupMaps'],
        },
      );

    return Object.values(
      flatRowLevelPermissionPredicateGroupMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((group) => group.deletedAt === null)
      .sort(
        (a, b) =>
          (a.positionInRowLevelPermissionPredicateGroup ?? 0) -
          (b.positionInRowLevelPermissionPredicateGroup ?? 0),
      )
      .map(fromFlatRowLevelPermissionPredicateGroupToDto);
  }

  private async hasRowLevelPermissionFeature(
    workspaceId: string,
  ): Promise<boolean> {
    const hasValidEnterprisePlan = this.enterprisePlanService.isValid();

    const isRowLevelPermissionEnabled =
      await this.billingService.hasEntitlement(
        workspaceId,
        BillingEntitlementKey.RLS,
      );

    return hasValidEnterprisePlan && isRowLevelPermissionEnabled;
  }
}
