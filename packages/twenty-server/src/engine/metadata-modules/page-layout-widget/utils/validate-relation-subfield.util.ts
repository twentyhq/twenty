import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getCompositeSubfieldNames } from 'src/engine/metadata-modules/page-layout-widget/utils/get-composite-subfield-names.util';
import { resolveMorphTargetObjectId } from 'src/engine/metadata-modules/page-layout-widget/utils/resolve-morph-target-object-id.util';
import { validateCompositeSubfield } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-composite-subfield.util';

export const validateRelationSubfield = ({
  field,
  subFieldName,
  paramName,
  allFields,
  fieldsByObjectId,
}: {
  field: FlatFieldMetadata;
  subFieldName: string | null | undefined;
  paramName: string;
  allFields: FlatFieldMetadata[];
  fieldsByObjectId: Map<string, FlatFieldMetadata[]>;
}): void => {
  if (!isDefined(subFieldName)) {
    return;
  }

  const dotIndex = subFieldName.indexOf('.');
  const nestedFieldName =
    dotIndex === -1 ? subFieldName : subFieldName.slice(0, dotIndex);
  const nestedSubFieldName =
    dotIndex === -1 ? undefined : subFieldName.slice(dotIndex + 1);

  if (!nestedFieldName) {
    throw new Error(`Relation subfield "${subFieldName}" is invalid.`);
  }

  if (isDefined(nestedSubFieldName) && nestedSubFieldName.includes('.')) {
    throw new Error(`Relation subfield "${subFieldName}" is invalid.`);
  }

  let targetObjectId = field.relationTargetObjectMetadataId ?? null;

  if (field.type === FieldMetadataType.MORPH_RELATION) {
    targetObjectId = resolveMorphTargetObjectId({ field, allFields });
  }

  if (!isDefined(targetObjectId)) {
    throw new Error(
      `Relation field "${paramName}" does not have a resolvable target object.`,
    );
  }

  const targetFields = fieldsByObjectId.get(targetObjectId) ?? [];
  const nestedField = targetFields.find(
    (targetField) => targetField.name === nestedFieldName,
  );

  if (!isDefined(nestedField)) {
    throw new Error(
      `Relation subfield "${nestedFieldName}" not found for "${paramName}".`,
    );
  }

  if (!isDefined(nestedSubFieldName)) {
    if (isCompositeFieldMetadataType(nestedField.type)) {
      const allowed = getCompositeSubfieldNames(nestedField.type);

      throw new Error(
        `Composite field "${nestedFieldName}" requires a subfield. Use "${nestedFieldName}.<subfield>" where subfield is one of: ${allowed.join(', ')}`,
      );
    }

    return;
  }

  if (!isCompositeFieldMetadataType(nestedField.type)) {
    throw new Error(`Field "${nestedFieldName}" is not composite.`);
  }

  validateCompositeSubfield({
    field: nestedField,
    subFieldName: nestedSubFieldName,
    paramName: nestedFieldName,
  });
};
