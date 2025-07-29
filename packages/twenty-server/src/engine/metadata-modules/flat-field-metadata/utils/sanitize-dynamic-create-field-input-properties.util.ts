import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';

export const sanitizeDynamicCreateFieldInputProperties = (
  rawCreateFieldInput: CreateFieldInput,
): Pick<
  CreateFieldInput,
  'defaultValue' | 'options' | 'settings' | 'relationCreationPayload'
> => {
  const tmp = trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties();
  return {};
};
