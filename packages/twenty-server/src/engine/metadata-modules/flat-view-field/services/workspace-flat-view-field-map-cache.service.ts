import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatViewFieldMaps } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field-maps.type';
import { fromViewFieldEntityToFlatViewField } from 'src/engine/metadata-modules/flat-view-field/utils/from-view-field-entity-to-flat-view-field.util';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatViewFieldMaps')
export class WorkspaceFlatViewFieldMapCacheService extends WorkspaceCacheProvider<FlatViewFieldMaps> {
  constructor(
    @InjectRepository(ViewFieldEntity)
    private readonly viewFieldRepository: Repository<ViewFieldEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatViewFieldMaps> {
    const existingViewFields = await this.viewFieldRepository.find({
      where: {
        workspaceId,
      },
      withDeleted: true,
    });

    const flatViewFieldMaps = createEmptyFlatEntityMaps();

    for (const viewFieldEntity of existingViewFields) {
      const flatViewField = fromViewFieldEntityToFlatViewField(viewFieldEntity);

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatViewField,
        flatEntityMapsToMutate: flatViewFieldMaps,
      });
    }

    return flatViewFieldMaps;
  }
}
