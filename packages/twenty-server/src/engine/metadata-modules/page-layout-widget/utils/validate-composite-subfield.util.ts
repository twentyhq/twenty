import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getCompositeSubfieldNames } from 'src/engine/metadata-modules/page-layout-widget/utils/get-composite-subfield-names.util';

export const validateCompositeSubfield = ({
  field,
  subFieldName,
  paramName,
}: {
  field: FlatFieldMetadata;
  subFieldName: string | null | undefined;
  paramName: string;
}): void => {
  if (!isDefined(subFieldName)) {
    const allowed = getCompositeSubfieldNames(field.type);

    throw new Error(
      `Composite field "${paramName}" requires a subfield. Allowed: ${allowed.join(', ')}`,
    );
  }

  if (subFieldName.includes('.')) {
    throw new Error(`Composite subfield "${subFieldName}" is invalid.`);
  }

  const allowedSubFields = getCompositeSubfieldNames(field.type);
  const isValid = allowedSubFields.some((value) => value === subFieldName);

  if (!isValid) {
    throw new Error(
      `Invalid subfield "${subFieldName}" for "${paramName}". Allowed: ${allowedSubFields.join(
        ', ',
      )}`,
    );
  }
};
