import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ALL_FLAT_ENTITY_MAPS_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-maps-properties.constant';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { WorkspaceFlatMapCacheRegistryService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache-registry.service';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';

@Injectable()
export class WorkspaceManyOrAllFlatEntityMapsCacheService {
  private readonly logger = new Logger(
    WorkspaceManyOrAllFlatEntityMapsCacheService.name,
  );

  constructor(
    private readonly cacheRegistry: WorkspaceFlatMapCacheRegistryService,
  ) {}

  private async executeActionForManyOrAllFlatEntity<
    K extends (keyof AllFlatEntityMaps)[] = (keyof AllFlatEntityMaps)[],
  >({
    action,
    flatMapsKeys,
  }: {
    flatMapsKeys: K | undefined;
    action: (args: {
      service: WorkspaceFlatMapCacheService<AllFlatEntityMaps[K[number]]>;
      flatMapKey: K[number];
    }) => Promise<void>;
  }): Promise<void> {
    const keysToProcess = isDefined(flatMapsKeys)
      ? flatMapsKeys
      : ALL_FLAT_ENTITY_MAPS_PROPERTIES;

    const results = await Promise.allSettled(
      keysToProcess.map(async (flatMapKey) => {
        try {
          const service = this.cacheRegistry.getCacheServiceOrThrow(
            flatMapKey as K[number],
          );

          return await action({
            flatMapKey: flatMapKey,
            service,
          });
        } catch (error) {
          this.logger.error(
            `Failed to run action on flat entity maps of ${flatMapKey}`,
            error,
          );
          throw error;
        }
      }),
    );

    const failures = results.filter((result) => result.status === 'rejected');

    if (failures.length > 0) {
      this.logger.error(`${failures.length} operations failed`);
      throw new Error(`Failed to process ${failures.length} flat entity maps`);
    }
  }

  public async getOrRecomputeManyOrAllFlatEntityMaps<
    T extends (keyof AllFlatEntityMaps)[] = (keyof AllFlatEntityMaps)[],
  >({
    flatMapsKeys,
    workspaceId,
  }: {
    workspaceId: string;
    flatMapsKeys?: T;
  }): Promise<Pick<AllFlatEntityMaps, T[number]>> {
    let pickedFlatEntityMaps = {} as Pick<AllFlatEntityMaps, T[number]>;

    await this.executeActionForManyOrAllFlatEntity({
      action: async ({ service, flatMapKey }) => {
        const cacheResult = await service.getExistingOrRecomputeFlatMaps({
          workspaceId,
        });

        pickedFlatEntityMaps[flatMapKey] = cacheResult;
      },
      flatMapsKeys,
    });

    return pickedFlatEntityMaps;
  }

  public async invalidateFlatEntityMaps<
    T extends (keyof AllFlatEntityMaps)[] = (keyof AllFlatEntityMaps)[],
  >({
    flatMapsKeys,
    workspaceId,
  }: {
    workspaceId: string;
    flatMapsKeys?: T;
  }): Promise<void> {
    await this.executeActionForManyOrAllFlatEntity({
      action: async ({ service }) =>
        await service.invalidateCache({ workspaceId }),
      flatMapsKeys,
    });
  }

  public async flushFlatEntityMaps<
    T extends (keyof AllFlatEntityMaps)[] = (keyof AllFlatEntityMaps)[],
  >({
    flatMapsKeys,
    workspaceId,
  }: {
    workspaceId: string;
    flatMapsKeys?: T;
  }): Promise<void> {
    await this.executeActionForManyOrAllFlatEntity({
      action: async ({ service }) => await service.flushCache({ workspaceId }),
      flatMapsKeys,
    });
  }
}
