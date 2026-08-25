import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatViewFieldMaps } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field-maps.type';
import { fromViewFieldEntityToFlatViewField } from 'src/engine/metadata-modules/flat-view-field/utils/from-view-field-entity-to-flat-view-field.util';
import { ViewFieldGroupEntity } from 'src/engine/metadata-modules/view-field-group/entities/view-field-group.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatViewFieldMaps', { packingPonderation: 32 })
export class WorkspaceFlatViewFieldMapCacheService extends WorkspaceCacheProvider<FlatViewFieldMaps> {
  async computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): Promise<FlatViewFieldMaps> {
    const [viewFields, applications, fieldMetadatas, views, viewFieldGroups] =
      await Promise.all([
        recomputeContext.findAll(ViewFieldEntity),
        recomputeContext.findAll(ApplicationEntity, [
          'id',
          'universalIdentifier',
        ]),
        recomputeContext.findAll(FieldMetadataEntity, [
          'id',
          'universalIdentifier',
        ]),
        recomputeContext.findAll(ViewEntity, ['id', 'universalIdentifier']),
        recomputeContext.findAll(ViewFieldGroupEntity, [
          'id',
          'universalIdentifier',
        ]),
      ]);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fieldMetadatas);
    const viewIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(views);
    const viewFieldGroupIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(viewFieldGroups);

    const flatViewFieldMaps = createEmptyFlatEntityMaps();

    for (const viewFieldEntity of viewFields) {
      const flatViewField = fromViewFieldEntityToFlatViewField({
        entity: viewFieldEntity,
        applicationIdToUniversalIdentifierMap,
        fieldMetadataIdToUniversalIdentifierMap,
        viewIdToUniversalIdentifierMap,
        viewFieldGroupIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatViewField,
        flatEntityMapsToMutate: flatViewFieldMaps,
      });
    }

    return flatViewFieldMaps;
  }
}
