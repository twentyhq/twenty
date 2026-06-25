import { isDefined } from 'twenty-shared/utils';

import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { PageLayoutWidgetFieldValidationException } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget-field-validation.exception';
import { findActiveFlatFieldMetadataById } from 'src/engine/metadata-modules/page-layout-widget/utils/find-active-flat-field-metadata-by-id.util';
import { validateCompositeSubfield } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-composite-subfield.util';
import { validateRelationSubfield } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-relation-subfield.util';

const toGroupByFieldValidationException = (
  error: unknown,
): PageLayoutWidgetFieldValidationException => {
  if (error instanceof PageLayoutWidgetFieldValidationException) {
    return error;
  }

  return new PageLayoutWidgetFieldValidationException(
    error instanceof Error ? error.message : String(error),
  );
};

export const validateGroupByFieldOrThrow = ({
  fieldId,
  subFieldName,
  paramName,
  objectMetadataId,
  flatFieldMetadataMaps,
  allFields,
  fieldsByObjectId,
}: {
  fieldId?: string | null;
  subFieldName?: string | null;
  paramName: string;
  objectMetadataId: string;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  allFields: FlatFieldMetadata[];
  fieldsByObjectId: Map<string, FlatFieldMetadata[]>;
}): void => {
  if (!isDefined(fieldId)) {
    throw new PageLayoutWidgetFieldValidationException(
      `${paramName} is required.`,
    );
  }

  const field = findActiveFlatFieldMetadataById(fieldId, flatFieldMetadataMaps);

  if (!isDefined(field)) {
    throw new PageLayoutWidgetFieldValidationException(
      `${paramName} "${fieldId}" not found.`,
    );
  }

  if (field.objectMetadataId !== objectMetadataId) {
    throw new PageLayoutWidgetFieldValidationException(
      `${paramName} must belong to objectMetadataId "${objectMetadataId}".`,
    );
  }

  if (isCompositeFieldMetadataType(field.type)) {
    try {
      validateCompositeSubfield({
        field,
        subFieldName,
        paramName: field.name,
      });
    } catch (error) {
      throw toGroupByFieldValidationException(error);
    }

    return;
  }

  if (isMorphOrRelationFlatFieldMetadata(field)) {
    try {
      validateRelationSubfield({
        field,
        subFieldName,
        paramName: field.name,
        allFields,
        fieldsByObjectId,
      });
    } catch (error) {
      throw toGroupByFieldValidationException(error);
    }

    return;
  }

  if (isDefined(subFieldName)) {
    throw new PageLayoutWidgetFieldValidationException(
      `Field "${field.name}" does not support subfields.`,
    );
  }
};
