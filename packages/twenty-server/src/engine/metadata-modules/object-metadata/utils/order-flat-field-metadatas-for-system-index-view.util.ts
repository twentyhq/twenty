export const orderFlatFieldMetadatasForSystemIndexView = <
  TFlatFieldMetadata extends { universalIdentifier: string },
>({
  flatFieldMetadatas,
  labelIdentifierFieldMetadataUniversalIdentifier,
}: {
  flatFieldMetadatas: TFlatFieldMetadata[];
  labelIdentifierFieldMetadataUniversalIdentifier: string | null;
}): TFlatFieldMetadata[] => [
  ...flatFieldMetadatas.filter(
    (flatFieldMetadata) =>
      flatFieldMetadata.universalIdentifier ===
      labelIdentifierFieldMetadataUniversalIdentifier,
  ),
  ...flatFieldMetadatas.filter(
    (flatFieldMetadata) =>
      flatFieldMetadata.universalIdentifier !==
      labelIdentifierFieldMetadataUniversalIdentifier,
  ),
];
