import { type ComponentProps } from 'react';

import { type IconsProvider } from '../src/icon/providers/IconsProvider';

export const ICONS_PROVIDER_PROP_DESCRIPTIONS = {
  children:
    'One React element containing consumers of Icon or useIcons. Loads the complete icon map asynchronously.',
} satisfies Partial<Record<keyof ComponentProps<typeof IconsProvider>, string>>;
