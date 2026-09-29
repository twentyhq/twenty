import { type ComponentProps } from 'react';

import { type NavigationBar } from '../src/components/navigation/NavigationBar/NavigationBar';

export const NAVIGATION_BAR_PROP_DESCRIPTIONS = {
  activeItemName:
    'Name of the item to highlight. The application owns navigation.',
  isHidden: 'Hides the bar visually and from the accessibility tree.',
  items:
    'Navigation items with a unique name, accessible label, Icon component, and onClick callback.',
} satisfies Partial<Record<keyof ComponentProps<typeof NavigationBar>, string>>;
