import { isDefined } from 'class-validator';

import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import {
  STANDARD_PAGE_LAYOUTS,
  type StandardPageLayoutName,
  type StandardPageLayoutTabName,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import { type StandardPageLayoutMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-page-layout-metadata-related-entity-ids.util';

export type CreateStandardPageLayoutTabContext<
  L extends StandardPageLayoutName,
> = {
  layoutName: L;
  tabName: StandardPageLayoutTabName<L>;
  title: string;
  position: number;
};

export type CreateStandardPageLayoutTabArgs<
  L extends StandardPageLayoutName = StandardPageLayoutName,
> = {
  now: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  standardPageLayoutMetadataRelatedEntityIds: StandardPageLayoutMetadataRelatedEntityIds;
  context: CreateStandardPageLayoutTabContext<L>;
};

export const createStandardPageLayoutTabFlatMetadata = <
  L extends StandardPageLayoutName,
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

  // @ts-expect-error ignore
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

type TabBuilderArgs = Omit<CreateStandardPageLayoutTabArgs, 'context'>;

export const STANDARD_FLAT_PAGE_LAYOUT_TAB_BUILDERS_BY_LAYOUT_NAME = {
  myFirstDashboard: {
    tab1: (args: TabBuilderArgs) =>
      createStandardPageLayoutTabFlatMetadata({
        ...args,
        context: {
          layoutName: 'myFirstDashboard',
          tabName: 'tab1',
          title: STANDARD_PAGE_LAYOUTS.myFirstDashboard.tabs.tab1.title,
          position: STANDARD_PAGE_LAYOUTS.myFirstDashboard.tabs.tab1.position,
        },
      }),
  },
} satisfies {
  [L in StandardPageLayoutName]: {
    [T in StandardPageLayoutTabName<L>]: (
      args: TabBuilderArgs,
    ) => FlatPageLayoutTab;
  };
};
