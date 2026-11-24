// One criterion of a FilterBar: its label, its values (already translated) and
// which of them are selected. Values are plain strings, so a facet can come
// from a fixed vocabulary (partner regions) or from the data (app categories).
export type FilterFacetOption = {
  label: string;
  value: string;
};

export type FilterFacet = {
  key: string;
  label: string;
  options: readonly FilterFacetOption[];
  selected: ReadonlySet<string>;
};
