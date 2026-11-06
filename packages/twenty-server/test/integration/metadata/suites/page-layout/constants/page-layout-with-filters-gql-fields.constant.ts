export const PAGE_LAYOUT_WITH_FILTERS_GQL_FIELDS = `
  id
  type
  filters {
    id
    label
    type
    position
    defaultValue {
      conditions {
        operand
        value
      }
    }
  }
`;
