import { type AllMetadataName } from '@/metadata/types/AllMetadataName';

// selectOption is not a syncable metadata entity yet; it will join AllMetadataName once it is.
export type DeterministicEntityNamespace =
  | AllMetadataName
  | 'selectOption'
  | 'indexField';
