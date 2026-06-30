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
  const allowedSubFields = getCompositeSubfieldNames(field.type);

  if (!isDefined(subFieldName)) {
    throw new Error(
      `Composite field "${paramName}" requires a subfield. Allowed: ${allowedSubFields.join(', ')}`,
    );
  }

  if (subFieldName.includes('.')) {
    throw new Error(`Composite subfield "${subFieldName}" is invalid.`);
  }

  if (!allowedSubFields.includes(subFieldName)) {
    throw new Error(
      `Invalid subfield "${subFieldName}" for "${paramName}". Allowed: ${allowedSubFields.join(
        ', ',
      )}`,
    );
  }
};
