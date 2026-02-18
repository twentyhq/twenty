import { isDefined } from 'twenty-shared/utils';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { STANDARD_PAGE_LAYOUTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import { type StandardObjectMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-object-metadata-related-entity-ids.util';
import { type StandardPageLayoutMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-page-layout-metadata-related-entity-ids.util';

export type CreateStandardPageLayoutContext = {
  layoutName: string;
  name: string;
  type: PageLayoutType;
  objectUniversalIdentifier: string | null;
  defaultTabUniversalIdentifier: string | null;
};

export type CreateStandardPageLayoutArgs = {
  now: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  standardObjectMetadataRelatedEntityIds: StandardObjectMetadataRelatedEntityIds;
  standardPageLayoutMetadataRelatedEntityIds: StandardPageLayoutMetadataRelatedEntityIds;
  context: CreateStandardPageLayoutContext;
};

export const findObjectNameByUniversalIdentifier = (
  objectUniversalIdentifier: string,
): string => {
  for (const [objectName, objectConfig] of Object.entries(STANDARD_OBJECTS)) {
    if (objectConfig.universalIdentifier === objectUniversalIdentifier) {
      return objectName;
    }
  }

  throw new Error(
    `Object with universal identifier ${objectUniversalIdentifier} not found`,
  );
};

const findTabKeyByUniversalIdentifier = (
  layoutName: string,
  tabUniversalIdentifier: string,
): string => {
  const layout =
    STANDARD_PAGE_LAYOUTS[layoutName as keyof typeof STANDARD_PAGE_LAYOUTS];

  if (!isDefined(layout)) {
    throw new Error(`Layout with name ${layoutName} not found`);
  }

  for (const [tabKey, tab] of Object.entries(layout.tabs)) {
    if (tab.universalIdentifier === tabUniversalIdentifier) {
      return tabKey;
    }
  }

  throw new Error(
    `Tab with universal identifier ${tabUniversalIdentifier} not found`,
  );
};

export const createStandardPageLayoutFlatMetadata = ({
  context: {
    layoutName,
    name,
    type,
    objectUniversalIdentifier,
    defaultTabUniversalIdentifier,
  },
  workspaceId,
  twentyStandardApplicationId,
  standardObjectMetadataRelatedEntityIds,
  standardPageLayoutMetadataRelatedEntityIds,
  now,
}: CreateStandardPageLayoutArgs): FlatPageLayout => {
  const layout =
    STANDARD_PAGE_LAYOUTS[layoutName as keyof typeof STANDARD_PAGE_LAYOUTS];
  const universalIdentifier = layout.universalIdentifier;
  const layoutIds = standardPageLayoutMetadataRelatedEntityIds[layoutName];

  let objectMetadataId: string | null = null;

  if (objectUniversalIdentifier) {
    const objectName = findObjectNameByUniversalIdentifier(
      objectUniversalIdentifier,
    );

    if (isDefined(objectName)) {
      objectMetadataId =
        standardObjectMetadataRelatedEntityIds[
          objectName as keyof typeof standardObjectMetadataRelatedEntityIds
        ]?.id ?? null;
    }
  }

  let defaultTabToFocusOnMobileAndSidePanelId: string | null = null;

  if (defaultTabUniversalIdentifier) {
    const tabKey = findTabKeyByUniversalIdentifier(
      layoutName,
      defaultTabUniversalIdentifier,
    );

    if (isDefined(tabKey)) {
      defaultTabToFocusOnMobileAndSidePanelId = layoutIds.tabs[tabKey].id;
    }
  }

  return {
    id: layoutIds.id,
    universalIdentifier,
    applicationId: twentyStandardApplicationId,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    workspaceId,
    name,
    type,
    objectMetadataId,
    objectMetadataUniversalIdentifier: objectUniversalIdentifier,
    tabIds: [],
    tabUniversalIdentifiers: [],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    defaultTabToFocusOnMobileAndSidePanelId,
    defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier:
      defaultTabUniversalIdentifier,
  };
};
