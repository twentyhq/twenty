import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import {
  type CreateStandardPageLayoutWidgetArgs,
  STANDARD_FLAT_PAGE_LAYOUT_WIDGET_BUILDERS,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout/create-standard-page-layout-widget-flat-metadata.util';

export type BuildStandardFlatPageLayoutWidgetMetadataMapsArgs = Omit<
  CreateStandardPageLayoutWidgetArgs,
  'context'
>;

export const buildStandardFlatPageLayoutWidgetMetadataMaps = (
  args: BuildStandardFlatPageLayoutWidgetMetadataMapsArgs,
): FlatEntityMaps<FlatPageLayoutWidget> => {
  const allWidgetMetadatas: FlatPageLayoutWidget[] = Object.values(
    STANDARD_FLAT_PAGE_LAYOUT_WIDGET_BUILDERS,
  ).flatMap((layoutTabs) =>
    Object.values(layoutTabs).flatMap((tabWidgets) =>
      Object.values(tabWidgets).map((builder) => builder(args)),
    ),
  );

  let flatPageLayoutWidgetMaps = createEmptyFlatEntityMaps();

  for (const widgetMetadata of allWidgetMetadatas) {
    flatPageLayoutWidgetMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: widgetMetadata,
      flatEntityMaps: flatPageLayoutWidgetMaps,
    });
  }

  return flatPageLayoutWidgetMaps;
};
