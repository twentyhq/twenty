export const PAGE_LAYOUT_GQL_FIELDS = `
  id
  name
  type
  objectMetadataId
  createdAt
  updatedAt
  deletedAt
`;

export const PAGE_LAYOUT_TAB_GQL_FIELDS = `
  id
  title
  position
  pageLayoutId
  createdAt
  updatedAt
  deletedAt
`;

export const PAGE_LAYOUT_WIDGET_CONFIGURATION_FIELDS = `
  ... on IframeConfiguration {
    url
  }
  ... on BarChartConfiguration {
    graphType
    aggregateFieldMetadataId
    aggregateOperation
    groupByFieldMetadataIdX
    orderByX
    groupByFieldMetadataIdY
    orderByY
    omitNullValues
    xAxisName
    yAxisName
    rangeMin
    rangeMax
    filter
    color
    description
  }
  ... on LineChartConfiguration {
    graphType
    aggregateFieldMetadataId
    aggregateOperation
    groupByFieldMetadataIdX
    orderByX
    groupByFieldMetadataIdY
    orderByY
    omitNullValues
    xAxisName
    yAxisName
    rangeMin
    rangeMax
    filter
    color
    description
  }
  ... on PieChartConfiguration {
    graphType
    groupByFieldMetadataId
    aggregateFieldMetadataId
    aggregateOperation
    orderBy
    filter
    color
    description
  }
  ... on NumberChartConfiguration {
    graphType
    aggregateFieldMetadataId
    aggregateOperation
    description
    filter
    color
    format
    label
  }
  ... on GaugeChartConfiguration {
    graphType
    aggregateFieldMetadataId
    aggregateOperation
    aggregateOperationTotal
    aggregateFieldMetadataIdTotal
    description
    filter
  }
`;

export const PAGE_LAYOUT_WIDGET_GQL_FIELDS = `
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
    ${PAGE_LAYOUT_WIDGET_CONFIGURATION_FIELDS}
  }
  createdAt
  updatedAt
  deletedAt
`;
