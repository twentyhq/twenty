import { MetadataFlatEntity } from "src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type";
import { AllMetadataName } from "twenty-shared/metadata";

export type FlatEntityToCreateDeleteUpdate<T extends AllMetadataName> = {
  flatEntityToUpdate: MetadataFlatEntity<T>[];
  flatEntityToCreate: MetadataFlatEntity<T>[];
  flatEntityToDelete: MetadataFlatEntity<T>[];
};
