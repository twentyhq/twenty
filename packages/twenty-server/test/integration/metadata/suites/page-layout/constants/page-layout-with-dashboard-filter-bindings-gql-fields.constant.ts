export const PAGE_LAYOUT_WITH_DASHBOARD_FILTER_BINDINGS_GQL_FIELDS = `
  id
  filters {
    id
  }
  tabs {
    id
    widgets {
      id
      configuration {
        ... on AggregateChartConfiguration {
          dashboardFilterBindings {
            pageLayoutFilterId
            fieldMetadataId
          }
        }
        ... on RecordTableConfiguration {
          dashboardFilterBindings {
            pageLayoutFilterId
            fieldMetadataId
          }
        }
      }
    }
  }
`;
