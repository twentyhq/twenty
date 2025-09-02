import {
  findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow,
  type GetRelationFlatFieldMetadatasUtilArgs,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/find-relation-flat-field-metadatas-target-flat-field-metadata-or-throw.util';

export const findRelationFlatFieldMetadataTargetFlatFieldMetadata = (
  args: GetRelationFlatFieldMetadatasUtilArgs,
):
  | ReturnType<
      typeof findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow
    >
  | undefined => {
  try {
    return findRelationFlatFieldMetadataTargetFlatFieldMetadataOrThrow(args);
  } catch {
    return undefined;
  }
};
