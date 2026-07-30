import { FieldMetadataType } from 'twenty-shared/types';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export const isFlatFieldMetadataDisplayableInDefaultView = ({
  flatFieldMetadata,
  labelIdentifierFieldMetadataUniversalIdentifier,
}: {
  flatFieldMetadata: Pick<
    UniversalFlatFieldMetadata,
    'name' | 'type' | 'universalIdentifier'
  >;
  labelIdentifierFieldMetadataUniversalIdentifier: string | null;
}): boolean =>
  flatFieldMetadata.name !== 'deletedAt' &&
  flatFieldMetadata.type !== FieldMetadataType.TS_VECTOR &&
  flatFieldMetadata.type !== FieldMetadataType.POSITION &&
  flatFieldMetadata.type !== FieldMetadataType.MORPH_RELATION &&
  flatFieldMetadata.type !== FieldMetadataType.RELATION &&
  (flatFieldMetadata.name !== 'id' ||
    flatFieldMetadata.universalIdentifier ===
      labelIdentifierFieldMetadataUniversalIdentifier);
