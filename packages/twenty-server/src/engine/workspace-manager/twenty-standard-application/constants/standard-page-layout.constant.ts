/**
 * Standard Page Layout constants for the Revenue Overview Dashboard.
 *
 * These universalIdentifiers are stable UUIDs used to identify page layouts,
 * tabs, and widgets across workspaces for sync purposes.
 */

export const STANDARD_PAGE_LAYOUTS = {
  revenueOverview: {
    universalIdentifier: '20202020-d001-4d01-8d01-da5ab0a00001',
    name: 'Revenue Overview',
    tabs: {
      revenueOverview: {
        universalIdentifier: '20202020-d011-4d11-8d11-da5ab0a01001',
        title: 'Revenue Overview',
        position: 0,
        widgets: {
          headerRevenueToDate: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11001',
          },
          amountClosedThisYear: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11002',
          },
          dealsWonThisYear: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11003',
          },
          wonRateThisYear: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11004',
          },
          headerCurrentPipeline: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11005',
          },
          dealRevenueByStage: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11006',
          },
          headerPerformanceThisQuarter: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11007',
          },
          leadsCreatedThisQuarter: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11008',
          },
          oppsCreatedThisQuarter: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11009',
          },
          wonOppsCreatedCount: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a1100a',
          },
          wonOppsCreatedAmount: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a1100b',
          },
          oppsWonCount: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a1100c',
          },
          oppsWonAmount: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a1100d',
          },
          oppsBySeller: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a1100e',
          },
          revenueBySeller: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a1100f',
          },
        },
      },
      leadExploration: {
        universalIdentifier: '20202020-d012-4d12-8d12-da5ab0a02001',
        title: 'Lead exploration',
        position: 1,
        widgets: {
          leadCreationOverTime: {
            universalIdentifier: '20202020-d121-4d21-8d21-da5ab0a21001',
          },
          companyCreationOverTime: {
            universalIdentifier: '20202020-d121-4d21-8d21-da5ab0a21002',
          },
          companiesBySize: {
            universalIdentifier: '20202020-d121-4d21-8d21-da5ab0a21003',
          },
          companiesByIndustry: {
            universalIdentifier: '20202020-d121-4d21-8d21-da5ab0a21004',
          },
        },
      },
    },
  },
} as const;

export type StandardPageLayoutName = keyof typeof STANDARD_PAGE_LAYOUTS;

export type StandardPageLayoutTabName<L extends StandardPageLayoutName> =
  keyof (typeof STANDARD_PAGE_LAYOUTS)[L]['tabs'];

// Widget names for specific tabs
export type RevenueOverviewTabWidgetName =
  keyof (typeof STANDARD_PAGE_LAYOUTS)['revenueOverview']['tabs']['revenueOverview']['widgets'];

export type LeadExplorationTabWidgetName =
  keyof (typeof STANDARD_PAGE_LAYOUTS)['revenueOverview']['tabs']['leadExploration']['widgets'];
