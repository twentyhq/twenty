import { type ComponentProps } from 'react';

import { type GroupedCatalog } from '../src/testing/GroupedCatalog';

export const GROUPED_CATALOG_PROP_DESCRIPTIONS = {
  groups:
    'Labeled groups of examples. Each example has a unique label within its group and can include additional data for the renderer.',
  renderExample:
    'Renders one example, including its visible label or accessible name. The layout supplies the surrounding cell and spacing.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof GroupedCatalog>, string>
>;
