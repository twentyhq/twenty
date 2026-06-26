export interface RecordFilterValueDependencies {
  currentWorkspaceMemberId?: string;
  currentRecord?: {
    id: string;
    objectMetadataNameSingular: string;
  };
  timeZone?: string;
}
