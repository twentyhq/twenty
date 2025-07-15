import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { isFieldMetadataInterfaceOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

export const computeJoinColumnName = ({
  fieldMetadataInput,
  targetObjectMetadataNameSingular,
}: {
  fieldMetadataInput: CreateFieldInput;
  targetObjectMetadataNameSingular?: string;
}) => {
  const isMorphRelation = isFieldMetadataInterfaceOfType(
    fieldMetadataInput,
    FieldMetadataType.MORPH_RELATION,
  );

  if (isMorphRelation) {
    if (!isDefined(targetObjectMetadataNameSingular)) {
      throw new FieldMetadataException(
        'Target object metadata name should be defined for morph relations',
        FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
      );
    }

    return `${fieldMetadataInput.name}${capitalize(targetObjectMetadataNameSingular)}Id`;
  }

  if (isDefined(targetObjectMetadataNameSingular)) {
    throw new FieldMetadataException(
      'Target object metadata name should be empty for simple relations',
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    );
  }

  return `${fieldMetadataInput.name}Id`;
};
