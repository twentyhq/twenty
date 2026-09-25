import { type ComponentProps } from 'react';

import { type Loader } from '../src/primitives/feedback/Loader/Loader';

export const LOADER_PROP_DESCRIPTIONS = {
  color:
    'Theme color for the animated dot and border. When omitted, inherits the button color if available, otherwise the tertiary text color.',
} satisfies Partial<Record<keyof ComponentProps<typeof Loader>, string>>;
