// TODO(charles): drop these columns once 2.55 leaves the cross-upgrade window; only upgrade commands use them
export type UnusedObjectMetadataColumnName =
  | 'readability'
  | 'writability'
  | 'readabilityParentFieldUniversalIdentifiers'
  | 'sharingReach';
