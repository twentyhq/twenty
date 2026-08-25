import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { fromPageLayoutWidgetEntityToFlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-entity-to-flat-page-layout-widget.util';
import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatPageLayoutWidgetMaps', { packingPonderation: 5 })
export class WorkspaceFlatPageLayoutWidgetMapCacheService extends WorkspaceCacheProvider<FlatPageLayoutWidgetMaps> {
  async computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): Promise<FlatPageLayoutWidgetMaps> {
    const [
      existingPageLayoutWidgets,
      applications,
      pageLayoutTabs,
      objectMetadatas,
      fieldMetadatas,
      frontComponents,
      views,
    ] = await Promise.all([
      recomputeContext.findAll(PageLayoutWidgetEntity),
      recomputeContext.findAll(ApplicationEntity, [
        'id',
        'universalIdentifier',
      ]),
      recomputeContext.findAll(PageLayoutTabEntity, [
        'id',
        'universalIdentifier',
      ]),
      recomputeContext.findAll(ObjectMetadataEntity, [
        'id',
        'universalIdentifier',
      ]),
      recomputeContext.findAll(FieldMetadataEntity, [
        'id',
        'universalIdentifier',
      ]),
      recomputeContext.findAll(FrontComponentEntity, [
        'id',
        'universalIdentifier',
      ]),
      recomputeContext.findAll(ViewEntity, ['id', 'universalIdentifier']),
    ]);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const pageLayoutTabIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(pageLayoutTabs);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const fieldMetadataUniversalIdentifierById = Object.fromEntries(
      createIdToUniversalIdentifierMap(fieldMetadatas),
    );
    const frontComponentUniversalIdentifierById = Object.fromEntries(
      createIdToUniversalIdentifierMap(frontComponents),
    );
    const viewUniversalIdentifierById = Object.fromEntries(
      createIdToUniversalIdentifierMap(views),
    );

    const flatPageLayoutWidgetMaps = createEmptyFlatEntityMaps();

    for (const pageLayoutWidgetEntity of existingPageLayoutWidgets) {
      const flatPageLayoutWidget =
        fromPageLayoutWidgetEntityToFlatPageLayoutWidget({
          entity: pageLayoutWidgetEntity,
          applicationIdToUniversalIdentifierMap,
          pageLayoutTabIdToUniversalIdentifierMap,
          objectMetadataIdToUniversalIdentifierMap,
          fieldMetadataUniversalIdentifierById,
          frontComponentUniversalIdentifierById,
          viewUniversalIdentifierById,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatPageLayoutWidget,
        flatEntityMapsToMutate: flatPageLayoutWidgetMaps,
      });
    }

    return flatPageLayoutWidgetMaps;
  }
}
