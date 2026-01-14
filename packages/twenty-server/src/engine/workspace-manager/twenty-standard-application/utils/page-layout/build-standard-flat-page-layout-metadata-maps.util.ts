import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type CreateStandardPageLayoutArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout/create-standard-page-layout-flat-metadata.util';
import { STANDARD_FLAT_PAGE_LAYOUT_BUILDERS_BY_LAYOUT_NAME } from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout/standard-flat-page-layout-builders.constant';

export type BuildStandardFlatPageLayoutMetadataMapsArgs = Omit<
  CreateStandardPageLayoutArgs,
  'context'
>;

export const buildStandardFlatPageLayoutMetadataMaps = (
  args: BuildStandardFlatPageLayoutMetadataMapsArgs,
): FlatEntityMaps<FlatPageLayout> => {
  const allPageLayoutMetadatas: FlatPageLayout[] = Object.values(
    STANDARD_FLAT_PAGE_LAYOUT_BUILDERS_BY_LAYOUT_NAME,
  ).map((builder) => builder(args));

  let flatPageLayoutMaps = createEmptyFlatEntityMaps();

  for (const pageLayoutMetadata of allPageLayoutMetadatas) {
    flatPageLayoutMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: pageLayoutMetadata,
      flatEntityMaps: flatPageLayoutMaps,
    });
  }

  return flatPageLayoutMaps;
};
