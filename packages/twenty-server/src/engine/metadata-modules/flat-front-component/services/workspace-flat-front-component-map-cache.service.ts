import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatFrontComponentMaps } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component-maps.type';
import { fromFrontComponentEntityToFlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/utils/from-front-component-entity-to-flat-front-component.util';
import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatFrontComponentMaps')
export class WorkspaceFlatFrontComponentMapCacheService extends WorkspaceCacheProvider<FlatFrontComponentMaps> {
  constructor(
    @InjectRepository(FrontComponentEntity)
    private readonly frontComponentRepository: Repository<FrontComponentEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatFrontComponentMaps> {
    const [frontComponents, applications] = await Promise.all([
      this.frontComponentRepository.find({
        where: { workspaceId },
      }),
      this.applicationRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
    ]);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);

    const flatFrontComponentMaps = createEmptyFlatEntityMaps();

    for (const frontComponentEntity of frontComponents) {
      const flatFrontComponent = fromFrontComponentEntityToFlatFrontComponent({
        entity: frontComponentEntity,
        applicationIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatFrontComponent,
        flatEntityMapsToMutate: flatFrontComponentMaps,
      });
    }

    return flatFrontComponentMaps;
  }
}
