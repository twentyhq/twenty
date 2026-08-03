import { buildReservedSystemFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-reserved-system-flat-field-metadatas-for-custom-object.util';
import { isFlatFieldMetadataDisplayableInDefaultView } from 'src/engine/metadata-modules/object-metadata/utils/is-flat-field-metadata-displayable-in-default-view.util';
import { orderFlatFieldMetadatasForSystemIndexView } from 'src/engine/metadata-modules/object-metadata/utils/order-flat-field-metadatas-for-system-index-view.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export const computeDefaultIndexViewFieldPositionByFieldUniversalIdentifier = ({
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

  const orderedFlatFieldMetadatas = orderFlatFieldMetadatasForSystemIndexView({
    labelIdentifierFieldMetadataUniversalIdentifier,
    flatFieldMetadatas: [
      ...callerFlatFieldMetadatas,
      ...displayableSystemFlatFieldMetadatas,
    ],
  });

  return new Map(
    orderedFlatFieldMetadatas.map((flatFieldMetadata, position) => [
      flatFieldMetadata.universalIdentifier,
      position,
    ]),
  );
};
