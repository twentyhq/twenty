import {
  Leaf,
  Node,
} from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { generateFakeField } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-field';
import { FormFieldMetadata } from 'src/modules/workflow/workflow-executor/workflow-actions/form/types/workflow-form-action-settings.type';

export const generateFakeFormResponse = (
  formMetadata: FormFieldMetadata[],
): Record<string, Leaf | Node> => {
  return formMetadata.reduce((acc, formFieldMetadata) => {
    acc[formFieldMetadata.name] = generateFakeField({
      type: formFieldMetadata.type,
      label: formFieldMetadata.label,
    });

    return acc;
  }, {});
};
