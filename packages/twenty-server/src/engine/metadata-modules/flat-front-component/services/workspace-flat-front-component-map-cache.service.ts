import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatFrontComponentMaps } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component-maps.type';
import { fromFrontComponentEntityToFlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/utils/from-front-component-entity-to-flat-front-component.util';
import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatFrontComponentMaps')
export class WorkspaceFlatFrontComponentMapCacheService extends WorkspaceCacheProvider<FlatFrontComponentMaps> {
  constructor(
    @InjectRepository(FrontComponentEntity)
    private readonly frontComponentRepository: Repository<FrontComponentEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatFrontComponentMaps> {
    const frontComponents = await this.frontComponentRepository.find({
      where: { workspaceId },
    });

    const flatFrontComponentMaps = createEmptyFlatEntityMaps();

    for (const frontComponentEntity of frontComponents) {
      const flatFrontComponent =
        fromFrontComponentEntityToFlatFrontComponent(frontComponentEntity);

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatFrontComponent,
        flatEntityMapsToMutate: flatFrontComponentMaps,
      });
    }

    return flatFrontComponentMaps;
  }
}
