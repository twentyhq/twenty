import { Injectable } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type ViewChildEntityKind } from 'src/engine/metadata-modules/view-permissions/types/view-permissions.types';

@Injectable()
export class ViewEntityLookupService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async findViewIdByEntityIdAndKind(
    kind: ViewChildEntityKind,
    entityId: string,
    workspaceId: string,
  ): Promise<string | null> {
    switch (kind) {
      case 'viewField': {
        const { flatViewFieldMaps } =
          await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
            { workspaceId, flatMapsKeys: ['flatViewFieldMaps'] },
          );

        return (
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: entityId,
            flatEntityMaps: flatViewFieldMaps,
          })?.viewId ?? null
        );
      }

      case 'viewFilter': {
        const { flatViewFilterMaps } =
          await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
            { workspaceId, flatMapsKeys: ['flatViewFilterMaps'] },
          );

        return (
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: entityId,
            flatEntityMaps: flatViewFilterMaps,
          })?.viewId ?? null
        );
      }

      case 'viewFilterGroup': {
        const { flatViewFilterGroupMaps } =
          await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
            { workspaceId, flatMapsKeys: ['flatViewFilterGroupMaps'] },
          );

        return (
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: entityId,
            flatEntityMaps: flatViewFilterGroupMaps,
          })?.viewId ?? null
        );
      }

      case 'viewGroup': {
        const { flatViewGroupMaps } =
          await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
            { workspaceId, flatMapsKeys: ['flatViewGroupMaps'] },
          );

        return (
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: entityId,
            flatEntityMaps: flatViewGroupMaps,
          })?.viewId ?? null
        );
      }

      case 'viewSort': {
        const { flatViewSortMaps } =
          await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
            { workspaceId, flatMapsKeys: ['flatViewSortMaps'] },
          );

        return (
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: entityId,
            flatEntityMaps: flatViewSortMaps,
          })?.viewId ?? null
        );
      }
      default:
        return null;
    }
  }
}
