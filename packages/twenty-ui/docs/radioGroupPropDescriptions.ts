import { type RadioGroupProps } from '../src/primitives/input/RadioGroup/types/RadioGroupProps';

export const RADIO_GROUP_PROP_DESCRIPTIONS = {
  layout:
    'list arranges options in the orientation direction. grid fills the available width with responsive columns.',
  minColumnWidth:
    'Minimum grid column width in pixels. Columns can shrink below this width when the container is narrower.',
  orientation:
    'Visual layout direction, reflected in data-orientation. Does not change arrow-key navigation or set aria-orientation.',
} satisfies Partial<Record<keyof RadioGroupProps, string>>;
