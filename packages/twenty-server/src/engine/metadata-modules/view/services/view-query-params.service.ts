import { Injectable } from '@nestjs/common';

import {
  OrderByDirection,
  RecordFilterGroupLogicalOperator,
  type RecordGqlOperationFilter,
  ViewFilterGroupLogicalOperator,
  ViewType,
} from 'twenty-shared/types';
import {
  computeRecordGqlOperationFilter,
  isDefined,
  type RecordFilter,
  type RecordFilterGroup,
} from 'twenty-shared/utils';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { ViewSortDirection } from 'src/engine/metadata-modules/view-sort/enums/view-sort-direction';
import { DEFAULT_TIMEZONE } from 'src/engine/metadata-modules/view/constants/default-timezone.constant';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export type ViewQueryParams = {
  objectNameSingular: string;
  filter: RecordGqlOperationFilter;
  orderBy: ObjectRecordOrderBy;
  viewName: string;
  viewType: ViewType;
};

@Injectable()
export class ViewQueryParamsService {
  constructor(
    private readonly viewService: ViewService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async resolveViewToQueryParams(
    viewId: string,
    workspaceId: string,
    currentWorkspaceMemberId?: string,
  ): Promise<ViewQueryParams> {
    const view = await this.viewService.findById(viewId, workspaceId);

    if (!view) {
      throw new Error(`View with id ${viewId} not found`);
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const objectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: view.objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    const timeZone = await this.getWorkspaceMemberTimezoneIfAvailable(
      workspaceId,
      currentWorkspaceMemberId,
    );

    const recordFilters: RecordFilter[] = (view.viewFilters ?? [])
      .map((viewFilter) => {
        const field = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: viewFilter.fieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        });

        if (!field) return null;

        return {
          id: viewFilter.id,
          fieldMetadataId: viewFilter.fieldMetadataId,
          value: viewFilter.value ?? '',
          type: field.type,
          recordFilterGroupId: viewFilter.viewFilterGroupId,
          operand: viewFilter.operand,
          subFieldName: viewFilter.subFieldName,
        } as RecordFilter;
      })
      .filter(isDefined);

    const recordFilterGroups: RecordFilterGroup[] = (
      view.viewFilterGroups ?? []
    ).map((group) => ({
      id: group.id,
      parentRecordFilterGroupId: group.parentViewFilterGroupId,
      logicalOperator:
        group.logicalOperator === ViewFilterGroupLogicalOperator.OR
          ? RecordFilterGroupLogicalOperator.OR
          : RecordFilterGroupLogicalOperator.AND,
    }));

    const fields = recordFilters
      .map((filter) => {
        const field = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: filter.fieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        });

        if (!field) return null;

        return {
          id: field.id,
          name: field.name,
          type: field.type,
          label: field.label,
          options: field.options?.map((opt) => ({
            id: opt.id ?? '',
            label: opt.label,
            value: opt.value,
            color: 'color' in opt ? opt.color : undefined,
            position: opt.position,
          })),
        };
      })
      .filter(isDefined);

    const filter = computeRecordGqlOperationFilter({
      fields,
      recordFilters,
      recordFilterGroups,
      filterValueDependencies: { currentWorkspaceMemberId, timeZone },
    });

    const orderBy: ObjectRecordOrderBy = (view.viewSorts ?? [])
      .map((sort) => {
        const field = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: sort.fieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        });

        if (!field) return null;

        return {
          [field.name]:
            sort.direction === ViewSortDirection.DESC
              ? OrderByDirection.DescNullsLast
              : OrderByDirection.AscNullsFirst,
        };
      })
      .filter(isDefined);

    return {
      objectNameSingular: objectMetadata.nameSingular,
      filter,
      orderBy,
      viewName: view.name,
      viewType: view.type,
    };
  }

  private async getWorkspaceMemberTimezoneIfAvailable(
    workspaceId: string,
    currentWorkspaceMemberId?: string,
  ): Promise<string> {
    if (!isDefined(currentWorkspaceMemberId)) {
      return DEFAULT_TIMEZONE;
    }

    try {
      const workspaceMemberRepository =
        await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
          workspaceId,
          'workspaceMember',
        );

      const workspaceMember = await workspaceMemberRepository.findOne({
        where: { id: currentWorkspaceMemberId },
      });

      return workspaceMember?.timeZone ?? DEFAULT_TIMEZONE;
    } catch {
      return DEFAULT_TIMEZONE;
    }
  }
}
