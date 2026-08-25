import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { ALL_METADATA_ENTITY_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-entity-by-metadata-name.constant';
import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';

// Metadata entities plus the few core entities cache providers fetch that
// have no metadata name.
export const CACHE_FETCHABLE_ENTITY_BY_NAME = {
  ...ALL_METADATA_ENTITY_BY_METADATA_NAME,
  application: ApplicationEntity,
  indexFieldMetadata: IndexFieldMetadataEntity,
  apiKey: ApiKeyEntity,
  featureFlag: FeatureFlagEntity,
} as const;
