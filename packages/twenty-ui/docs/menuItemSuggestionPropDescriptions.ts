import { type ComponentProps } from 'react';

import { type MenuItemSuggestion } from '../src/components/navigation/MenuItemSuggestion/MenuItemSuggestion';

export const MENU_ITEM_SUGGESTION_PROP_DESCRIPTIONS = {
  LeftIcon: 'Leading icon component.',
  withIconContainer: 'Places leading content in an icon container.',
  text: 'Main row label.',
  contextualText: 'Supporting text beside the main label.',
  contextualTextPosition: 'Position of the supporting text.',
  selected: 'Applies selected styling. The application owns selection.',
  className: 'Class applied to the row.',
  onClick:
    'Activation callback. When supplied, the row gains button semantics, a tab stop, and Enter/Space activation.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof MenuItemSuggestion>, string>
>;
