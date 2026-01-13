import { isDefined } from 'class-validator';

import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { STANDARD_PAGE_LAYOUTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import { type AllStandardPageLayoutName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-page-layout-name.type';
import { type AllStandardPageLayoutTabName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-page-layout-tab-name.type';
import { type StandardPageLayoutMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-page-layout-metadata-related-entity-ids.util';

export type CreateStandardPageLayoutTabContext<
  L extends AllStandardPageLayoutName,
> = {
  layoutName: L;
  tabName: AllStandardPageLayoutTabName<L>;
  title: string;
  position: number;
};

export type CreateStandardPageLayoutTabArgs<
  L extends AllStandardPageLayoutName = AllStandardPageLayoutName,
> = {
  now: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  standardPageLayoutMetadataRelatedEntityIds: StandardPageLayoutMetadataRelatedEntityIds;
  context: CreateStandardPageLayoutTabContext<L>;
};

export const createStandardPageLayoutTabFlatMetadata = <
  L extends AllStandardPageLayoutName,
>({
  context: { layoutName, tabName, title, position },
  workspaceId,
  twentyStandardApplicationId,
  standardPageLayoutMetadataRelatedEntityIds,
  now,
}: CreateStandardPageLayoutTabArgs<L>): FlatPageLayoutTab => {
  const layoutIds = standardPageLayoutMetadataRelatedEntityIds[layoutName];
  // @ts-expect-error ignore
  const tabDefinition = STANDARD_PAGE_LAYOUTS[layoutName].tabs[tabName] as {
    universalIdentifier: string;
  };

  if (!isDefined(tabDefinition)) {
    throw new Error(
      `Invalid configuration ${layoutName} ${tabName.toString()}`,
    );
  }

  const tabIds = layoutIds.tabs[tabName];

  const widgetIds = Object.values(tabIds.widgets).map(
    (widget: { id: string }) => widget.id,
  );

  return {
    id: tabIds.id,
    universalIdentifier: tabDefinition.universalIdentifier,
    applicationId: twentyStandardApplicationId,
    workspaceId,
    title,
    position,
    pageLayoutId: layoutIds.id,
    widgetIds,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
