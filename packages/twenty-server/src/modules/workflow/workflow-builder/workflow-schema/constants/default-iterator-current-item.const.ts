import { type Leaf } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';

export const DEFAULT_ITERATOR_CURRENT_ITEM: Leaf = {
  label: 'Current Item',
  isLeaf: true,
  type: 'unknown',
  value: null,
};
