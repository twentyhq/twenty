// Only upgrade commands still use these columns; drop them once 2.55 leaves the cross-upgrade window
export type UnusedObjectMetadataColumnName =
  | 'readability'
  | 'writability'
  | 'readabilityParentFieldUniversalIdentifiers'
  | 'sharingReach';
