import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';

export const isCreateFieldInput = (
  input: UpdateFieldInput | CreateFieldInput,
): input is CreateFieldInput => {
  return Object.prototype.hasOwnProperty.call(
    input,
    'relationCreationPayload' as const satisfies keyof CreateFieldInput,
  );
};
