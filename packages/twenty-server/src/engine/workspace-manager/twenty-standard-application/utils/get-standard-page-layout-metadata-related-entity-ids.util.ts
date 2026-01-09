import { v4 } from 'uuid';

import type { STANDARD_PAGE_LAYOUTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';

type InferWidgetIds<W> = {
  [K in keyof W]: { id: string };
};

type InferTabIds<T> = {
  [K in keyof T]: {
    id: string;
    widgets: T[K] extends { widgets: infer W } ? InferWidgetIds<W> : never;
  };
};

type InferLayoutIds<L> = {
  [K in keyof L]: {
    id: string;
    tabs: L[K] extends { tabs: infer T } ? InferTabIds<T> : never;
  };
};

export type StandardPageLayoutMetadataRelatedEntityIds = InferLayoutIds<
  typeof STANDARD_PAGE_LAYOUTS
>;

export const getStandardPageLayoutMetadataRelatedEntityIds =
  (): StandardPageLayoutMetadataRelatedEntityIds => {
    const tab1Widgets: StandardPageLayoutMetadataRelatedEntityIds['myFirstDashboard']['tabs']['tab1']['widgets'] =
      {
        welcomeRichText: { id: v4() },
        dealsByCompany: { id: v4() },
        pipelineValueByStage: { id: v4() },
        revenueTimeline: { id: v4() },
        opportunitiesByOwner: { id: v4() },
        stockMarketIframe: { id: v4() },
        dealsCreatedThisMonth: { id: v4() },
        dealValueCreatedThisMonth: { id: v4() },
      };

    return {
      myFirstDashboard: {
        id: v4(),
        tabs: {
          tab1: {
            id: v4(),
            widgets: tab1Widgets,
          },
        },
      },
    };
  };
