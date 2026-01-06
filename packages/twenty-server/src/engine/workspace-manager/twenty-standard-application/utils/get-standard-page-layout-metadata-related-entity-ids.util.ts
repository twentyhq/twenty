import { v4 } from 'uuid';

export type StandardPageLayoutMetadataRelatedEntityIds = {
  revenueOverview: {
    id: string;
    tabs: {
      revenueOverview: {
        id: string;
        widgets: {
          headerRevenueToDate: { id: string };
          amountClosedThisYear: { id: string };
          dealsWonThisYear: { id: string };
          wonRateThisYear: { id: string };
          headerCurrentPipeline: { id: string };
          dealRevenueByStage: { id: string };
          headerPerformanceThisQuarter: { id: string };
          leadsCreatedThisQuarter: { id: string };
          oppsCreatedThisQuarter: { id: string };
          wonOppsCreatedCount: { id: string };
          wonOppsCreatedAmount: { id: string };
          oppsWonCount: { id: string };
          oppsWonAmount: { id: string };
          oppsBySeller: { id: string };
          revenueBySeller: { id: string };
        };
      };
      leadExploration: {
        id: string;
        widgets: {
          leadCreationOverTime: { id: string };
          companyCreationOverTime: { id: string };
          companiesBySize: { id: string };
          companiesByIndustry: { id: string };
        };
      };
    };
  };
};

export const getStandardPageLayoutMetadataRelatedEntityIds =
  (): StandardPageLayoutMetadataRelatedEntityIds => {
    const revenueOverviewWidgets: StandardPageLayoutMetadataRelatedEntityIds['revenueOverview']['tabs']['revenueOverview']['widgets'] =
      {
        headerRevenueToDate: { id: v4() },
        amountClosedThisYear: { id: v4() },
        dealsWonThisYear: { id: v4() },
        wonRateThisYear: { id: v4() },
        headerCurrentPipeline: { id: v4() },
        dealRevenueByStage: { id: v4() },
        headerPerformanceThisQuarter: { id: v4() },
        leadsCreatedThisQuarter: { id: v4() },
        oppsCreatedThisQuarter: { id: v4() },
        wonOppsCreatedCount: { id: v4() },
        wonOppsCreatedAmount: { id: v4() },
        oppsWonCount: { id: v4() },
        oppsWonAmount: { id: v4() },
        oppsBySeller: { id: v4() },
        revenueBySeller: { id: v4() },
      };

    const leadExplorationWidgets: StandardPageLayoutMetadataRelatedEntityIds['revenueOverview']['tabs']['leadExploration']['widgets'] =
      {
        leadCreationOverTime: { id: v4() },
        companyCreationOverTime: { id: v4() },
        companiesBySize: { id: v4() },
        companiesByIndustry: { id: v4() },
      };

    return {
      revenueOverview: {
        id: v4(),
        tabs: {
          revenueOverview: {
            id: v4(),
            widgets: revenueOverviewWidgets,
          },
          leadExploration: {
            id: v4(),
            widgets: leadExplorationWidgets,
          },
        },
      },
    };
  };
