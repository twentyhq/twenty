import { FieldMetadataEntity } from "src/engine/metadata-modules/field-metadata/field-metadata.entity";
import { FlatFieldMetadataPropertiesToCompare } from "src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-properties-to-compare.type";
import { FromTo } from "twenty-shared/types";

export type FlatFieldMetadataPropertyUpdate<
  T extends FlatFieldMetadataPropertiesToCompare,
> = {
  property: T;
} & FromTo<FieldMetadataEntity[T]>;