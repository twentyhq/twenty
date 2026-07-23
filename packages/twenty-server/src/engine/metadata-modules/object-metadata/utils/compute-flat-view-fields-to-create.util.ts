import { getViewFieldUniversalIdentifier } from 'twenty-shared/application';

import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { isFlatFieldMetadataDisplayableInDefaultView } from 'src/engine/metadata-modules/object-metadata/utils/is-flat-field-metadata-displayable-in-default-view.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export const computeFlatViewFieldsToCreate = ({
  objectFlatFieldMetadatas,
  viewUniversalIdentifier,
  applicationUniversalIdentifier,
  labelIdentifierFieldMetadataUniversalIdentifier,
  excludeLabelIdentifier = false,
  startPosition = 0,
}: {
  applicationUniversalIdentifier: string;
  objectFlatFieldMetadatas: UniversalFlatFieldMetadata[];
  viewUniversalIdentifier: string;
  labelIdentifierFieldMetadataUniversalIdentifier: string | null;
  excludeLabelIdentifier?: boolean;
  startPosition?: number;
}): UniversalFlatViewField[] => {
  const createdAt = new Date().toISOString();
  const defaultViewFields = objectFlatFieldMetadatas
    .filter(
      (field) =>
        isFlatFieldMetadataDisplayableInDefaultView({
          flatFieldMetadata: field,
          labelIdentifierFieldMetadataUniversalIdentifier,
        }) &&
        // Exclude label identifier field when requested (e.g., for FIELDS_WIDGET views)
        (!excludeLabelIdentifier ||
          field.universalIdentifier !==
            labelIdentifierFieldMetadataUniversalIdentifier),
    )
    .sort((a, b) => {
      const aIsLabelIdentifierFieldMetadata =
        a.universalIdentifier ===
        labelIdentifierFieldMetadataUniversalIdentifier;
      const bIsLabelIdentifierFieldMetadata =
        b.universalIdentifier ===
        labelIdentifierFieldMetadataUniversalIdentifier;

      if (aIsLabelIdentifierFieldMetadata && !bIsLabelIdentifierFieldMetadata)
        return -1;
      if (!aIsLabelIdentifierFieldMetadata && bIsLabelIdentifierFieldMetadata)
        return 1;

      return 0;
    })
    .map<UniversalFlatViewField>((field, index) => ({
      fieldMetadataUniversalIdentifier: field.universalIdentifier,
      viewUniversalIdentifier,
      viewFieldGroupUniversalIdentifier: null,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      universalIdentifier: getViewFieldUniversalIdentifier({
        applicationUniversalIdentifier,
        viewUniversalIdentifier,
        fieldMetadataUniversalIdentifier: field.universalIdentifier,
      }),
      isVisible: true,
      size: DEFAULT_VIEW_FIELD_SIZE,
      position: startPosition + index,
      aggregateOperation: null,
      isActive: true,
      isSystemSideEffect: true,
      universalOverrides: null,
      applicationUniversalIdentifier,
    }));

  return defaultViewFields;
};
