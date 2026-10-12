export type PublicExportInventory = Record<
  string,
  {
    reExports: string[];
    values: Record<string, string>;
    types: Record<string, string>;
  }
>;
