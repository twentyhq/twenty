// Columns kept in the database but no longer read or written
export type UnusedObjectMetadataColumnName =
  | 'readability'
  | 'writability'
  | 'readabilityParentFieldUniversalIdentifiers'
  | 'sharingReach';
