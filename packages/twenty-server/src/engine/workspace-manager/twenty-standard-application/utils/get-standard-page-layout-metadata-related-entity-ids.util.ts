import { v4 } from 'uuid';

export type StandardPageLayoutMetadataRelatedEntityIds = {
  revenueOverview: {
    id: string;
    tabs: {
      tab1: {
        id: string;
        widgets: {
          welcomeRichText: { id: string };
          dealsByCompany: { id: string };
          pipelineValueByStage: { id: string };
          revenueTimeline: { id: string };
          opportunitiesByOwner: { id: string };
          stockMarketIframe: { id: string };
          dealsCreatedThisMonth: { id: string };
          dealValueCreatedThisMonth: { id: string };
        };
      };
    };
  };
};

export const getStandardPageLayoutMetadataRelatedEntityIds =
  (): StandardPageLayoutMetadataRelatedEntityIds => {
    const tab1Widgets: StandardPageLayoutMetadataRelatedEntityIds['revenueOverview']['tabs']['tab1']['widgets'] =
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
      revenueOverview: {
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
