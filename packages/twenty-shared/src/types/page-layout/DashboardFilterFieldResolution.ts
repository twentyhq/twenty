export type DashboardFilterFieldResolution =
  | {
      fieldMetadataId: string;
      source: 'OVERRIDE' | 'GROUP_BY' | 'WIDGET_FILTER' | 'CREATED_AT';
    }
  | { fieldMetadataId: null; source: 'NOT_APPLIED' | 'UNRESOLVED' };
