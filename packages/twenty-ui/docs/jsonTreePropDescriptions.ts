import { type ComponentProps } from 'react';

import { type JsonTree } from '../src/components/data-display/JsonTree/JsonTree';

export const JSON_TREE_PROP_DESCRIPTIONS = {
  value: 'JSON value to display. Supply value or entries, not both.',
  entries:
    'Named entries with stable id, label, and JSON value fields. Supply entries or value, not both.',
  getNodeHighlighting:
    'Returns blue, red, or partial-blue highlighting for a node key path.',
  shouldExpandNodeInitially:
    'Chooses initial expansion from the node keyPath and depth. The default expands the first two depths.',
  emptyStringLabel: 'Display text for an empty string.',
  emptyArrayLabel: 'Display text for an empty array.',
  emptyObjectLabel: 'Display text for an empty object.',
  arrowButtonCollapsedLabel:
    'Accessible label for the expand control on a collapsed node.',
  arrowButtonExpandedLabel:
    'Accessible label for the collapse control on an expanded node.',
  onNodeValueClick:
    'Called with the clicked value as displayed: leaf values as strings, and the empty label for empty strings, arrays, and objects.',
} satisfies Partial<Record<keyof ComponentProps<typeof JsonTree>, string>>;
