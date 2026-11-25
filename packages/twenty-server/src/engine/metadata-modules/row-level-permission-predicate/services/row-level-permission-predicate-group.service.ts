/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { type FindOptionsWhere, In, Not } from 'typeorm';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { fromFlatRowLevelPermissionPredicateGroupToDto } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-flat-row-level-permission-predicate-group-to-dto.util';
import { RowLevelPermissionPredicateGroupDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate-group.dto';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { CHANNEL_RECORD_RULE_UNIVERSAL_IDENTIFIER_SEEDS } from 'src/engine/permissions/channel-visibility/constants/channel-record-rule-universal-identifier-seeds.constant';
import { getChannelRecordRuleUniversalIdentifier } from 'src/engine/permissions/channel-visibility/utils/get-channel-record-rule-universal-identifier.util';
import { isWorkspaceMemberIndividualRole } from 'src/engine/permissions/workspace-member-individual-role/utils/is-workspace-member-individual-role.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class RowLevelPermissionPredicateGroupService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly billingService: BillingService,
    @InjectWorkspaceScopedRepository(RowLevelPermissionPredicateGroupEntity)
    private readonly rowLevelPermissionPredicateGroupRepository: WorkspaceScopedRepository<RowLevelPermissionPredicateGroupEntity>,
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

  public async deleteRowLevelPermissionPredicateGroupsOutsideIndividualRoles(
    workspaceId: string,
  ) {
    const { flatRoleMaps, flatRowLevelPermissionPredicateGroupMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatRoleMaps',
            'flatRowLevelPermissionPredicateGroupMaps',
          ],
        },
      );
    const flatRoles = Object.values(flatRoleMaps.byUniversalIdentifier).filter(
      isDefined,
    );

    // Channel visibility does not depend on the RLS entitlement: individual roles, and the channel record rules of user roles
    const individualRoleIds = flatRoles
      .filter(isWorkspaceMemberIndividualRole)
      .map(({ id }) => id);
    const channelRecordPredicateGroupIds = flatRoles
      .flatMap(({ universalIdentifier: roleUniversalIdentifier }) =>
        CHANNEL_RECORD_RULE_UNIVERSAL_IDENTIFIER_SEEDS.map(
          (ruleUniversalIdentifierSeed) =>
            flatRowLevelPermissionPredicateGroupMaps.byUniversalIdentifier[
              getChannelRecordRuleUniversalIdentifier({
                ruleUniversalIdentifierSeed,
                roleUniversalIdentifier,
                kind: 'group',
              })
            ]?.id,
        ),
      )
      .filter(isDefined);

    const criteria: FindOptionsWhere<RowLevelPermissionPredicateGroupEntity> = {
      ...(individualRoleIds.length > 0 && {
        roleId: Not(In(individualRoleIds)),
      }),
      ...(channelRecordPredicateGroupIds.length > 0 && {
        id: Not(In(channelRecordPredicateGroupIds)),
      }),
    };

    // Checking first keeps the common no-op a read and lets cleanup retry on every pass after a failed attempt
    const hasPredicateGroups =
      (await this.rowLevelPermissionPredicateGroupRepository.count(
        workspaceId,
        { where: criteria },
      )) > 0;

    if (!hasPredicateGroups) {
      return;
    }

    await this.rowLevelPermissionPredicateGroupRepository.delete(
      workspaceId,
      criteria,
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'rolesPermissions',
      'flatRowLevelPermissionPredicateMaps',
      'flatRowLevelPermissionPredicateGroupMaps',
      'flatFieldPermissionMaps',
    ]);
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
