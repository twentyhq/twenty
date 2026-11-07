import { type FieldMetadataType } from 'twenty-shared/types';
import { isNonEmptyString } from '@sniptt/guards';

import { generateFakeValue } from 'src/engine/utils/generate-fake-value';
import {
  type Leaf,
  type Node,
} from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';

type GenerateFakeFormFieldArgs = {
  type: FieldMetadataType;
  label: string;
  value?: string;
  selectedFieldId?: string;
};

export const generateFakeFormField = ({
  type,
  label,
  value,
  selectedFieldId,
}: GenerateFakeFormFieldArgs): Leaf | Node => ({
  isLeaf: true,
  type,
  label,
  value: value ?? generateFakeValue(type, 'FieldMetadataType'),
  // a select field keeps its source field, which later filters read its options from
  ...(isNonEmptyString(selectedFieldId)
    ? { fieldMetadataId: selectedFieldId }
    : {}),
});
