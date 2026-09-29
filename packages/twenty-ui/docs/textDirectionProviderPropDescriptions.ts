import { type ComponentProps } from 'react';

import { type TextDirectionProvider } from '../src/primitives/layout/TextDirectionProvider/TextDirectionProvider';

export const TEXT_DIRECTION_PROVIDER_PROP_DESCRIPTIONS = {
  children: 'Controls that receive the direction context.',
  direction:
    'Reading direction used by directional interactions. Also set the matching HTML `dir` attribute on the content.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof TextDirectionProvider>, string>
>;
