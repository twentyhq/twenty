import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_METADATA_ENTITY_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-entity-by-metadata-name.constant';

export type MetadataEntity<K extends AllMetadataName> = InstanceType<
  (typeof ALL_METADATA_ENTITY_BY_METADATA_NAME)[K]
>;
