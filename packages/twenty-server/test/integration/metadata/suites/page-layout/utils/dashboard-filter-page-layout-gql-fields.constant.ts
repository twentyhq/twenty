import { WIDGET_CONFIGURATION_GQL_FIELDS } from 'test/integration/metadata/suites/page-layout-widget/constants/widget-configuration-gql-fields.constant';

export const DASHBOARD_FILTER_PAGE_LAYOUT_GQL_FIELDS = `
  id
  name
  type
  dashboardFilters
  tabs {
    id
    title
    widgets {
      id
      title
      type
      objectMetadataId
      configuration {
        ${WIDGET_CONFIGURATION_GQL_FIELDS}
      }
    }
  }
`;
