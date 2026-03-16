import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';
import { FieldMetadataType } from 'twenty-shared/types';

export const computeFlatViewFieldsToCreate = ({
  objectFlatFieldMetadatas,
  viewUniversalIdentifier,
  flatApplication,
  labelIdentifierFieldMetadataUniversalIdentifier,
}: {
  flatApplication: FlatApplication;
  objectFlatFieldMetadatas: UniversalFlatFieldMetadata[];
  viewUniversalIdentifier: string;
  labelIdentifierFieldMetadataUniversalIdentifier: string | null;
}): UniversalFlatViewField[] => {
  const createdAt = new Date().toISOString();
  const defaultViewFields = objectFlatFieldMetadatas
    .filter(
      (field) =>
        field.name !== 'deletedAt' &&
        field.type !== FieldMetadataType.MORPH_RELATION &&
        field.type !== FieldMetadataType.RELATION &&
        // Include 'id' only if it's the label identifier (e.g., for junction tables)
        (field.name !== 'id' ||
          field.universalIdentifier ===
            labelIdentifierFieldMetadataUniversalIdentifier),
    )
    .map<UniversalFlatViewField>((field, index) => ({
      fieldMetadataUniversalIdentifier: field.universalIdentifier,
      viewUniversalIdentifier,
      viewFieldGroupUniversalIdentifier: null,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      universalIdentifier: v4(),
      isVisible: true,
      size: DEFAULT_VIEW_FIELD_SIZE,
      position: index,
      aggregateOperation: null,
      universalOverrides: null,
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
    }));

  return defaultViewFields;
};
