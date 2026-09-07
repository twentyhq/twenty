export const WIDGET_POSITION_GQL_FIELDS = `
  ... on PageLayoutWidgetGridPosition {
    layoutMode
    row
    column
    rowSpan
    columnSpan
  }
  ... on PageLayoutWidgetVerticalListPosition {
    layoutMode
    index
  }
  ... on PageLayoutWidgetCanvasPosition {
    layoutMode
  }
`;
