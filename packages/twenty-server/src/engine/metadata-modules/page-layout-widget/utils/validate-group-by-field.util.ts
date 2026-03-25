import { isDefined } from 'twenty-shared/utils';

import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { findActiveFlatFieldMetadataById } from 'src/engine/metadata-modules/page-layout-widget/utils/find-active-flat-field-metadata-by-id.util';
import { validateCompositeSubfield } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-composite-subfield.util';
import { validateRelationSubfield } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-relation-subfield.util';

export const validateGroupByField = ({
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
    throw new Error(`${paramName} is required.`);
  }

  const field = findActiveFlatFieldMetadataById(fieldId, flatFieldMetadataMaps);

  if (!isDefined(field)) {
    throw new Error(`${paramName} "${fieldId}" not found.`);
  }

  if (field.objectMetadataId !== objectMetadataId) {
    throw new Error(
      `${paramName} must belong to objectMetadataId "${objectMetadataId}".`,
    );
  }

  if (isCompositeFieldMetadataType(field.type)) {
    validateCompositeSubfield({
      field,
      subFieldName,
      paramName: field.name,
    });

    return;
  }

  if (isMorphOrRelationFlatFieldMetadata(field)) {
    validateRelationSubfield({
      field,
      subFieldName,
      paramName: field.name,
      allFields,
      fieldsByObjectId,
    });

    return;
  }

  if (isDefined(subFieldName)) {
    throw new Error(`Field "${field.name}" does not support subfields.`);
  }
};
