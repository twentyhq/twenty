import { type RadioGroupProps } from '../src/primitives/input/RadioGroup/types/RadioGroupProps';

export const RADIO_GROUP_PROP_DESCRIPTIONS = {
  orientation:
    'Visual layout direction, reflected in data-orientation. Does not change arrow-key navigation or set aria-orientation.',
} satisfies Partial<Record<keyof RadioGroupProps, string>>;
