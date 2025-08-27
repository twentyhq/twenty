import { type FieldMetadataType } from 'twenty-shared/types';

import { generateFakeValue } from 'src/engine/utils/generate-fake-value';
import {
  type Leaf,
  type Node,
} from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';

type GenerateFakeFormFieldArgs = {
  type: FieldMetadataType;
  label: string;
  value?: string;
};

export const generateFakeFormField = ({
  type,
  label,
  value,
}: GenerateFakeFormFieldArgs): Leaf | Node => {
  return {
    isLeaf: true,
    type: type,
    label: label,
    value: value ?? generateFakeValue(type, 'FieldMetadataType'),
  };
};
