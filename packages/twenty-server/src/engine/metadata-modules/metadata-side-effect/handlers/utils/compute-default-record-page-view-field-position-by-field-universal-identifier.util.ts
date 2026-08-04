import { buildReservedSystemFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-reserved-system-flat-field-metadatas-for-custom-object.util';
import { isFlatFieldMetadataDisplayableInDefaultView } from 'src/engine/metadata-modules/object-metadata/utils/is-flat-field-metadata-displayable-in-default-view.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// Record-page counterpart of computeDefaultIndexViewFieldPositionByFieldUniversalIdentifier:
// same deterministic caller-then-system ordering, except the label identifier field is
// excluded (the record page displays it in the title, not as a view field).
export const computeDefaultRecordPageViewFieldPositionByFieldUniversalIdentifier =
  ({
    applicationUniversalIdentifier,
    objectMetadataUniversalIdentifier,
    labelIdentifierFieldMetadataUniversalIdentifier,
    callerFlatFieldMetadatas,
  }: {
    applicationUniversalIdentifier: string;
    objectMetadataUniversalIdentifier: string;
    labelIdentifierFieldMetadataUniversalIdentifier: string | null;
    callerFlatFieldMetadatas: UniversalFlatFieldMetadata[];
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

    const orderedDisplayableFlatFieldMetadatas = [
      ...callerFlatFieldMetadatas,
      ...displayableSystemFlatFieldMetadatas,
    ].filter(
      (flatFieldMetadata) =>
        flatFieldMetadata.universalIdentifier !==
        labelIdentifierFieldMetadataUniversalIdentifier,
    );

    return new Map(
      orderedDisplayableFlatFieldMetadatas.map(
        (flatFieldMetadata, position) => [
          flatFieldMetadata.universalIdentifier,
          position,
        ],
      ),
    );
  };
