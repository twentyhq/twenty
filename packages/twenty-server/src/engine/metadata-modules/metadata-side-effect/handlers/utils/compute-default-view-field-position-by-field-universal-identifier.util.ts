import { isFlatFieldMetadataDisplayableInDefaultView } from 'src/engine/metadata-modules/object-metadata/utils/is-flat-field-metadata-displayable-in-default-view.util';
import { orderFlatFieldMetadatasForSystemIndexView } from 'src/engine/metadata-modules/object-metadata/utils/order-flat-field-metadatas-for-system-index-view.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export type ViewFieldLabelIdentifierPolicy = 'displayedFirst' | 'excluded';

export const computeDefaultViewFieldPositionByFieldUniversalIdentifier = ({
  systemFlatFieldMetadatas,
  callerFlatFieldMetadatas,
  labelIdentifierFieldMetadataUniversalIdentifier,
  labelIdentifierPolicy,
}: {
  systemFlatFieldMetadatas: UniversalFlatFieldMetadata[];
  callerFlatFieldMetadatas: UniversalFlatFieldMetadata[];
  labelIdentifierFieldMetadataUniversalIdentifier: string | null;
  labelIdentifierPolicy: ViewFieldLabelIdentifierPolicy;
}): Map<string, number> => {
  const displayableSystemFlatFieldMetadatas = systemFlatFieldMetadatas.filter(
    (flatFieldMetadata) =>
      isFlatFieldMetadataDisplayableInDefaultView({
        flatFieldMetadata,
        labelIdentifierFieldMetadataUniversalIdentifier,
      }),
  );

  const flatFieldMetadatas = [
    ...callerFlatFieldMetadatas,
    ...displayableSystemFlatFieldMetadatas,
  ];

  const orderedFlatFieldMetadatas =
    labelIdentifierPolicy === 'displayedFirst'
      ? orderFlatFieldMetadatasForSystemIndexView({
          labelIdentifierFieldMetadataUniversalIdentifier,
          flatFieldMetadatas,
        })
      : flatFieldMetadatas.filter(
          (flatFieldMetadata) =>
            flatFieldMetadata.universalIdentifier !==
            labelIdentifierFieldMetadataUniversalIdentifier,
        );

  return new Map(
    orderedFlatFieldMetadatas.map((flatFieldMetadata, position) => [
      flatFieldMetadata.universalIdentifier,
      position,
    ]),
  );
};
