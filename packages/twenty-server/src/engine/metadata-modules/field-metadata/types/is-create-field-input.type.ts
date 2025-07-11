import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';

export const isCreateFieldInput = (
  input: UpdateFieldInput | CreateFieldInput,
): input is CreateFieldInput => {
  return (
    Object.prototype.hasOwnProperty.call(
      input,
      'objectMetadataId' as const satisfies keyof CreateFieldInput,
    ) &&
    !Object.prototype.hasOwnProperty.call(
      input,
      // @ts-expect-error Expecting update key not to be in CreateFieldInput
      'update' as const satisfies keyof CreateFieldInput,
    )
  );
};
