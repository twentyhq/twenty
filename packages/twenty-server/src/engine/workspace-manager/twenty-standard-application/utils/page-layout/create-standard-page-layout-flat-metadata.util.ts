import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { STANDARD_PAGE_LAYOUTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import { type AllStandardPageLayoutName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-page-layout-name.type';
import { type StandardPageLayoutMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-page-layout-metadata-related-entity-ids.util';

export type CreateStandardPageLayoutContext = {
  layoutName: AllStandardPageLayoutName;
  name: string;
  type: PageLayoutType;
  objectMetadataId: string | null;
};

export type CreateStandardPageLayoutArgs = {
  now: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  standardPageLayoutMetadataRelatedEntityIds: StandardPageLayoutMetadataRelatedEntityIds;
  context: CreateStandardPageLayoutContext;
};

export const createStandardPageLayoutFlatMetadata = ({
  context: { layoutName, name, type, objectMetadataId },
  workspaceId,
  twentyStandardApplicationId,
  standardPageLayoutMetadataRelatedEntityIds,
  now,
}: CreateStandardPageLayoutArgs): FlatPageLayout => {
  const universalIdentifier =
    STANDARD_PAGE_LAYOUTS[layoutName].universalIdentifier;

  return {
    id: standardPageLayoutMetadataRelatedEntityIds[layoutName].id,
    universalIdentifier,
    applicationId: twentyStandardApplicationId,
    workspaceId,
    name,
    type,
    objectMetadataId,
    tabIds: [],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
