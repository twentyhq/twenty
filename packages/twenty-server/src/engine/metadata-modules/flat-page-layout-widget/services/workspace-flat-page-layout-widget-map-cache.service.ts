import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { fromPageLayoutWidgetEntityToFlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-entity-to-flat-page-layout-widget.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_PAGE_LAYOUT_WIDGET_ROWS_REQUIREMENT = {
  pageLayoutWidget: true,
  application: ['id', 'universalIdentifier'],
  pageLayoutTab: ['id', 'universalIdentifier'],
  objectMetadata: ['id', 'universalIdentifier'],
  fieldMetadata: ['id', 'universalIdentifier'],
  frontComponent: ['id', 'universalIdentifier'],
  view: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatPageLayoutWidgetMaps', { packingPonderation: 5 })
export class WorkspaceFlatPageLayoutWidgetMapCacheService extends MetadataFlatEntityMapsCacheProvider<'pageLayoutWidget'> {
  override readonly rowsRequirement = FLAT_PAGE_LAYOUT_WIDGET_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_PAGE_LAYOUT_WIDGET_ROWS_REQUIREMENT
  >): FlatPageLayoutWidgetMaps {
    const {
      pageLayoutWidget: existingPageLayoutWidgets,
      application: applications,
      pageLayoutTab: pageLayoutTabs,
      objectMetadata: objectMetadatas,
      fieldMetadata: fieldMetadatas,
      frontComponent: frontComponents,
      view: views,
    } = rows;

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
