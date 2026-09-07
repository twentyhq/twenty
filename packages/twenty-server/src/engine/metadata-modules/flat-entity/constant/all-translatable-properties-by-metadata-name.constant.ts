import { TRANSLATABLE_PROPERTIES_BY_METADATA_NAME } from 'twenty-shared/i18n';
import { type AllMetadataName } from 'twenty-shared/metadata';

// Widened from the shared literal so it can be indexed by any metadata name;
// entities with no translatable properties are simply absent.
export const ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME: Partial<
  Record<AllMetadataName, readonly string[]>
> = TRANSLATABLE_PROPERTIES_BY_METADATA_NAME;
