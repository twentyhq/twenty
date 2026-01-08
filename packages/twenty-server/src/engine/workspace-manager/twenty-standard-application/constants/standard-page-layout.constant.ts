export const STANDARD_PAGE_LAYOUTS = {
  revenueOverview: {
    universalIdentifier: '20202020-d001-4d01-8d01-da5ab0a00001',
    name: 'Dashboard Layout',
    tabs: {
      tab1: {
        universalIdentifier: '20202020-d011-4d11-8d11-da5ab0a01001',
        title: 'Tab 1', // TODO: ask Thomas to provide the appropriate title
        position: 0,
        widgets: {
          welcomeRichText: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11001',
          },
          dealsByCompany: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11002',
          },
          pipelineValueByStage: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11003',
          },
          revenueTimeline: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11004',
          },
          opportunitiesByOwner: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11005',
          },
          stockMarketIframe: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11006',
          },
          dealsCreatedThisMonth: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11007',
          },
          dealValueCreatedThisMonth: {
            universalIdentifier: '20202020-d111-4d11-8d11-da5ab0a11008',
          },
        },
      },
    },
  },
} as const;

export type StandardPageLayoutName = keyof typeof STANDARD_PAGE_LAYOUTS;

export type StandardPageLayoutTabName<L extends StandardPageLayoutName> =
  keyof (typeof STANDARD_PAGE_LAYOUTS)[L]['tabs'];

export type Tab1WidgetName =
  keyof (typeof STANDARD_PAGE_LAYOUTS)['revenueOverview']['tabs']['tab1']['widgets'];
