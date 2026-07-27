import { isFlatFieldMetadataDisplayableInDefaultView } from 'src/engine/metadata-modules/object-metadata/utils/is-flat-field-metadata-displayable-in-default-view.util';
import { buildReservedSystemFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-reserved-system-flat-field-metadatas-for-custom-object.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// The INDEX view field layout, shared by objectSystemFieldsAndIndexViewOnCreate
// (system fields) and fieldIndexViewFieldOnCreate (caller fields) so both derive
// the same positions. The label identifier view field must be at the strictly
// lowest position whatever field backs it: a caller field (e.g. name) or a
// reserved system field (e.g. id, when the object has no name field). Ordering
// it first here keeps that invariant regardless of which handler emits it.
export const computeDefaultIndexViewFieldPositionByFieldUniversalIdentifier = ({
  applicationUniversalIdentifier,
  objectMetadataUniversalIdentifier,
  labelIdentifierFieldMetadataUniversalIdentifier,
  displayableCallerFlatFieldMetadatas,
}: {
  applicationUniversalIdentifier: string;
  objectMetadataUniversalIdentifier: string;
  labelIdentifierFieldMetadataUniversalIdentifier: string | null;
  displayableCallerFlatFieldMetadatas: UniversalFlatFieldMetadata[];
}): Map<string, number> => {
  const displayableSystemFlatFieldMetadatas = Object.values(
    buildReservedSystemFlatFieldMetadatasForCustomObject({
      flatObjectMetadata: {
        applicationUniversalIdentifier,
        universalIdentifier: objectMetadataUniversalIdentifier,
      },
    }),
  ).filter((flatFieldMetadata) =>
    isFlatFieldMetadataDisplayableInDefaultView({
      flatFieldMetadata,
      labelIdentifierFieldMetadataUniversalIdentifier,
    }),
  );

  const displayableFlatFieldMetadatas = [
    ...displayableCallerFlatFieldMetadatas,
    ...displayableSystemFlatFieldMetadatas,
  ];

  const orderedDisplayableFlatFieldMetadatas = [
    ...displayableFlatFieldMetadatas.filter(
      (flatFieldMetadata) =>
        flatFieldMetadata.universalIdentifier ===
        labelIdentifierFieldMetadataUniversalIdentifier,
    ),
    ...displayableFlatFieldMetadatas.filter(
      (flatFieldMetadata) =>
        flatFieldMetadata.universalIdentifier !==
        labelIdentifierFieldMetadataUniversalIdentifier,
    ),
  ];

  return new Map(
    orderedDisplayableFlatFieldMetadatas.map((flatFieldMetadata, position) => [
      flatFieldMetadata.universalIdentifier,
      position,
    ]),
  );
};
