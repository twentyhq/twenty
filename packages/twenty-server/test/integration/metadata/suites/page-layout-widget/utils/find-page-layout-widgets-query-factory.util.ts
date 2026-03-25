import gql from 'graphql-tag';
import { WIDGET_CONFIGURATION_GQL_FIELDS } from 'test/integration/metadata/suites/page-layout-widget/constants/widget-configuration-gql-fields.constant';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindPageLayoutWidgetsFactoryInput = {
  pageLayoutTabId: string;
};

const DEFAULT_PAGE_LAYOUT_WIDGET_GQL_FIELDS = `
  id
  title
  type
  pageLayoutTabId
  objectMetadataId
  gridPosition {
    row
    column
    rowSpan
    columnSpan
  }
  configuration {
    ${WIDGET_CONFIGURATION_GQL_FIELDS}
  }
  createdAt
  updatedAt
  deletedAt
`;

export const findPageLayoutWidgetsQueryFactory = ({
  input,
  gqlFields = DEFAULT_PAGE_LAYOUT_WIDGET_GQL_FIELDS,
}: PerformMetadataQueryParams<FindPageLayoutWidgetsFactoryInput>) => ({
  query: gql`
    query GetPageLayoutWidgets($pageLayoutTabId: String!) {
      getPageLayoutWidgets(pageLayoutTabId: $pageLayoutTabId) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    pageLayoutTabId: input.pageLayoutTabId,
  },
});
