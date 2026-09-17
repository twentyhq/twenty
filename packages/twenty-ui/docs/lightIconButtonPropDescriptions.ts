import { type LightIconButtonProps } from '../src/components/LightIconButton/types/LightIconButtonProps';
import { ICON_BUTTON_PROP_DESCRIPTIONS } from './iconButtonPropDescriptions';

export const LIGHT_ICON_BUTTON_PROP_DESCRIPTIONS = {
  ...ICON_BUTTON_PROP_DESCRIPTIONS,
  emphasis:
    'Standard secondary text or subtle tertiary text. Semantic colors and solid surfaces keep their own colors.',
} satisfies Partial<Record<keyof LightIconButtonProps, string>>;
