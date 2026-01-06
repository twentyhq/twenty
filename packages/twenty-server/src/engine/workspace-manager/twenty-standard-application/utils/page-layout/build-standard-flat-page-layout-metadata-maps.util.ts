import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import {
  STANDARD_PAGE_LAYOUTS,
  type StandardPageLayoutName,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import { type StandardPageLayoutMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-page-layout-metadata-related-entity-ids.util';

export type BuildStandardFlatPageLayoutMetadataMapsArgs = {
  now: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  standardPageLayoutMetadataRelatedEntityIds: StandardPageLayoutMetadataRelatedEntityIds;
};

export const buildStandardFlatPageLayoutMetadataMaps = ({
  now,
  workspaceId,
  twentyStandardApplicationId,
  standardPageLayoutMetadataRelatedEntityIds,
}: BuildStandardFlatPageLayoutMetadataMapsArgs): FlatEntityMaps<FlatPageLayout> => {
  let flatPageLayoutMaps = createEmptyFlatEntityMaps();

  for (const layoutName of Object.keys(
    STANDARD_PAGE_LAYOUTS,
  ) as StandardPageLayoutName[]) {
    const layoutDefinition = STANDARD_PAGE_LAYOUTS[layoutName];
    const layoutIds = standardPageLayoutMetadataRelatedEntityIds[layoutName];

    const tabIds = Object.values(layoutIds.tabs).map((tab) => tab.id);

    const flatPageLayout: FlatPageLayout = {
      id: layoutIds.id,
      universalIdentifier: layoutDefinition.universalIdentifier,
      applicationId: twentyStandardApplicationId,
      workspaceId,
      name: layoutDefinition.name,
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: null,
      tabIds,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    flatPageLayoutMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: flatPageLayout,
      flatEntityMaps: flatPageLayoutMaps,
    });
  }

  return flatPageLayoutMaps;
};
