import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type CreateStandardPageLayoutTabArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-tab/create-standard-page-layout-tab-flat-metadata.util';
import { STANDARD_FLAT_PAGE_LAYOUT_TAB_BUILDERS_BY_LAYOUT_NAME } from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-tab/standard-flat-page-layout-tab-builders.constant';

export type BuildStandardFlatPageLayoutTabMetadataMapsArgs = Omit<
  CreateStandardPageLayoutTabArgs,
  'context'
>;

export const buildStandardFlatPageLayoutTabMetadataMaps = (
  args: BuildStandardFlatPageLayoutTabMetadataMapsArgs,
): FlatEntityMaps<FlatPageLayoutTab> => {
  const allPageLayoutTabMetadatas: FlatPageLayoutTab[] = Object.values(
    STANDARD_FLAT_PAGE_LAYOUT_TAB_BUILDERS_BY_LAYOUT_NAME,
  ).flatMap((builder) => builder(args));

  let flatPageLayoutTabMaps = createEmptyFlatEntityMaps();

  for (const pageLayoutTabMetadata of allPageLayoutTabMetadatas) {
    flatPageLayoutTabMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: pageLayoutTabMetadata,
      flatEntityMaps: flatPageLayoutTabMaps,
    });
  }

  return flatPageLayoutTabMaps;
};
