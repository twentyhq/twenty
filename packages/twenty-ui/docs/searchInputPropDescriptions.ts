import { type ComponentProps } from 'react';

import { type SearchInput } from '../src/components/input/SearchInput/SearchInput';

export const SEARCH_INPUT_PROP_DESCRIPTIONS = {
  value: 'Current search text.',
  onValueChange: 'Called with the new text. The application owns filtering.',
  onChange: 'Native input change event handler.',
  ref: 'Ref to the native input element.',
  size: 'Visual size of the input group and optional filter button.',
  placeholder:
    'Hint shown when the input is empty. Also used as the accessible name if no explicit label is supplied.',
  filterDropdown: 'Renders a filter popup around the supplied filter button.',
  autoFocus: 'Focuses the input when mounted.',
  disabled:
    'Disables the text input. Configure filter popup controls separately.',
  className: 'Class applied to the input.',
  id: 'Input ID, generated when omitted.',
  filterButtonAriaLabel: 'Accessible label for the optional filter button.',
  'aria-label': 'Accessible name when aria-labelledby is absent.',
  'aria-labelledby':
    'ID of the element that labels the input. Takes precedence over aria-label.',
} satisfies Partial<Record<keyof ComponentProps<typeof SearchInput>, string>>;
