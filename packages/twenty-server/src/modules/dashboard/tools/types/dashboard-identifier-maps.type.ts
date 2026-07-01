export type DashboardFieldIdentifiers = {
  type: string;
};

export type DashboardIdentifierMaps = {
  objectIdByName: Record<string, string>;
  fieldIdByObjectIdAndName: Map<string, string>;
  fieldById: Map<string, DashboardFieldIdentifiers>;
};
