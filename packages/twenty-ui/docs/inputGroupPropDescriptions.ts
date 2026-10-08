import { type InputGroupProps } from '../src/primitives/input/InputGroup/types/InputGroupProps';

export const INPUT_GROUP_PROP_DESCRIPTIONS = {
  size: 'Visual size of the layout and default size for inputs that omit size. Defaults to md.',
  ref: 'Ref to the layout element, a div by default.',
  render:
    'Customizes the layout element. Forward its props, children and ref. Native control props belong on the child input.',
} satisfies Partial<Record<keyof InputGroupProps, string>>;
