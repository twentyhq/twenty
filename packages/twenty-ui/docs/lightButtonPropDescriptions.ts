import { type LightButtonProps } from '../src/components/input/LightButton/types/LightButtonProps';

import { BUTTON_PROP_DESCRIPTIONS } from './buttonPropDescriptions';

export const LIGHT_BUTTON_PROP_DESCRIPTIONS = {
  ...BUTTON_PROP_DESCRIPTIONS,
  emphasis:
    'Uses secondary or tertiary text for neutral buttons. Semantic colors and solid surfaces retain their contrast treatment.',
} satisfies Partial<Record<keyof LightButtonProps, string>>;
