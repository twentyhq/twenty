import { FieldMetadataType } from 'twenty-shared/types';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// Single source of truth for which fields get a default view field, shared by
// the view-field builder and the create side-effect handlers so both agree on
// eligibility and position offsets.
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
  // Include 'id' only if it's the label identifier (e.g., for junction tables)
  (flatFieldMetadata.name !== 'id' ||
    flatFieldMetadata.universalIdentifier ===
      labelIdentifierFieldMetadataUniversalIdentifier);
