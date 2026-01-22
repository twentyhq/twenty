/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { fromFlatRowLevelPermissionPredicateGroupToDto } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-flat-row-level-permission-predicate-group-to-dto.util';
import { RowLevelPermissionPredicateGroupDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate-group.dto';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class RowLevelPermissionPredicateGroupService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly billingService: BillingService,
    @InjectRepository(RowLevelPermissionPredicateGroupEntity)
    private readonly rowLevelPermissionPredicateGroupRepository: Repository<RowLevelPermissionPredicateGroupEntity>,
    private readonly configService: ConfigService,
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

    return Object.values(flatRowLevelPermissionPredicateGroupMaps.byId)
      .filter(isDefined)
      .filter((group) => group.deletedAt === null)
      .sort(
        (a, b) =>
          (a.positionInRowLevelPermissionPredicateGroup ?? 0) -
          (b.positionInRowLevelPermissionPredicateGroup ?? 0),
      )
      .map(fromFlatRowLevelPermissionPredicateGroupToDto);
  }

  async findByRole(
    workspaceId: string,
    roleId: string,
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

    return Object.values(flatRowLevelPermissionPredicateGroupMaps.byId)
      .filter(isDefined)
      .filter((group) => group.deletedAt === null && group.roleId === roleId)
      .sort(
        (a, b) =>
          (a.positionInRowLevelPermissionPredicateGroup ?? 0) -
          (b.positionInRowLevelPermissionPredicateGroup ?? 0),
      )
      .map(fromFlatRowLevelPermissionPredicateGroupToDto);
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<RowLevelPermissionPredicateGroupDTO | null> {
    const hasRowLevelPermissionFeature =
      await this.hasRowLevelPermissionFeature(workspaceId);

    if (!hasRowLevelPermissionFeature) {
      return null;
    }

    const { flatRowLevelPermissionPredicateGroupMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRowLevelPermissionPredicateGroupMaps'],
        },
      );

    const flatGroup = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: flatRowLevelPermissionPredicateGroupMaps,
    });

    if (!isDefined(flatGroup) || flatGroup.deletedAt !== null) {
      return null;
    }

    return fromFlatRowLevelPermissionPredicateGroupToDto(flatGroup);
  }

  public async deleteAllRowLevelPermissionPredicateGroups(workspaceId: string) {
    await this.rowLevelPermissionPredicateGroupRepository.delete({
      workspaceId,
    });

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'rolesPermissions',
      'flatRowLevelPermissionPredicateMaps',
      'flatRowLevelPermissionPredicateGroupMaps',
    ]);
  }

  private async hasRowLevelPermissionFeature(
    workspaceId: string,
  ): Promise<boolean> {
    const hasValidEnterpriseKey = isDefined(
      this.configService.get('ENTERPRISE_KEY'),
    );

    const isRowLevelPermissionEnabled =
      await this.billingService.hasEntitlement(
        workspaceId,
        BillingEntitlementKey.RLS,
      );

    return hasValidEnterpriseKey && isRowLevelPermissionEnabled;
  }
}
