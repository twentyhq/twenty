import { type ComponentProps } from 'react';

import { type SearchInput } from '../src/components/input/SearchInput/SearchInput';
import { INPUT_PROP_DESCRIPTIONS } from './inputPropDescriptions';

export const SEARCH_INPUT_PROP_DESCRIPTIONS = {
  value: 'Current search text.',
  onValueChange: 'Called with the new text. The application owns filtering.',
  onChange: 'Native input change event handler.',
  ref: 'Ref to the native input element.',
  size: 'Visual size of the input group.',
  textAlign: INPUT_PROP_DESCRIPTIONS.textAlign,
  hasFocusRing:
    'Shows the group focus border. Defaults to false for all search inputs. Set true to opt in. Error styling remains visible.',
  placeholder:
    'Hint shown when the input is empty. Also used as the accessible name if no explicit label is supplied.',
  actions:
    'Controls rendered after the search field, such as a filter Dropdown. Set their size and accessible names on the controls.',
  autoFocus: 'Focuses the input when mounted.',
  disabled:
    'Disables the text input. Controls in actions keep their own state.',
  className: 'Class applied to the input.',
  id: 'Input ID, generated when omitted.',
  'aria-label': 'Accessible name when aria-labelledby is absent.',
  'aria-labelledby':
    'ID of the element that labels the input. Takes precedence over aria-label.',
} satisfies Partial<Record<keyof ComponentProps<typeof SearchInput>, string>>;
