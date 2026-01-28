import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataManyToOneRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-related-metadata-names.type';

export type EntityManyToOneIdByUniversalIdentifierMaps<
  T extends AllMetadataName,
> = {
  [P in MetadataManyToOneRelatedMetadataNames<T> as `${P}IdToUniversalIdentifierMap`]: Map<
    string,
    string
  >;
} & {
  applicationIdToUniversalIdentifierMap: Map<string, string>;
};
