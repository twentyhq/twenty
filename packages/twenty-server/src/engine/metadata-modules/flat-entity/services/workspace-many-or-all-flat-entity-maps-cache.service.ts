import { Injectable } from '@nestjs/common';

import { ALL_FLAT_ENTITY_MAPS_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-maps-properties.constant';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export type FlatEntityMapsCacheKeyName =
  | keyof AllFlatEntityMaps
  | 'flatApplicationMaps';

@Injectable()
export class WorkspaceManyOrAllFlatEntityMapsCacheService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  public async getOrRecomputeManyOrAllFlatEntityMaps<
    T extends FlatEntityMapsCacheKeyName[] = (keyof AllFlatEntityMaps)[],
  >({
    flatMapsKeys,
    workspaceId,
  }: {
    workspaceId: string;
    flatMapsKeys?: T;
  }): Promise<Pick<WorkspaceCacheDataMap, T[number]>> {
    return await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      (flatMapsKeys ??
        ALL_FLAT_ENTITY_MAPS_PROPERTIES) as (keyof WorkspaceCacheDataMap)[],
    );
  }

  public async invalidateFlatEntityMaps<
    T extends FlatEntityMapsCacheKeyName[] = (keyof AllFlatEntityMaps)[],
  >({
    flatMapsKeys,
    workspaceId,
  }: {
    workspaceId: string;
    flatMapsKeys?: T;
  }): Promise<void> {
    await this.workspaceCacheService.invalidateAndRecompute(
      workspaceId,
      (flatMapsKeys ??
        ALL_FLAT_ENTITY_MAPS_PROPERTIES) as (keyof WorkspaceCacheDataMap)[],
    );
  }

  public async flushFlatEntityMaps<
    T extends FlatEntityMapsCacheKeyName[] = (keyof AllFlatEntityMaps)[],
  >({
    flatMapsKeys,
    workspaceId,
  }: {
    workspaceId: string;
    flatMapsKeys?: T;
  }): Promise<void> {
    await this.workspaceCacheService.flush(
      workspaceId,
      (flatMapsKeys ??
        ALL_FLAT_ENTITY_MAPS_PROPERTIES) as (keyof WorkspaceCacheDataMap)[],
    );
  }
}
