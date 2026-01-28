import { MetadataManyToOneRelatedMetadataNames } from "src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-related-metadata-names.type";
import { AllMetadataName } from "twenty-shared/metadata";

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
