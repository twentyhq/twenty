import { type ComponentProps } from 'react';

import { type PhoneCountryPicker } from '../src/components/input/PhoneCountryPicker/PhoneCountryPicker';

export const PHONE_COUNTRY_PICKER_PROP_DESCRIPTIONS = {
  countries:
    'Prepared choices with a unique stable value, localized label, digits-only calling code without a plus sign, decorative flag node and optional disabled state. Matching choices retain their supplied order after the selected country.',
  value:
    'Controlled country identifier. Use null to clear the selection. Labels and calling codes do not replace this value.',
  defaultValue:
    'Initial uncontrolled country identifier. Omit it or use null to start empty.',
  onValueChange:
    'Receives the requested country identifier or null and Dropdown.SelectionGroup event details, including reason, event, trigger and cancel(). Cancel before updating controlled state to reject a selection.',
  disabled: 'Disables the trigger, search and country selection.',
  closeOnSelect:
    'Closes the dropdown after an accepted selection. Defaults to true.',
  'aria-label': 'Required accessible name for the country selector trigger.',
  children:
    'Optional trigger content replacing the default country flag or world icon and chevron.',
  ref: 'Ref to the trigger button, or the element composed through render.',
  render:
    'Composes the trigger with an element or render callback. Native attributes, handlers, className, style and ref target the trigger.',
  dropdownProps:
    'Props for the internally assembled Dropdown.Root, including controlled open state and open-change events. The picker fixes its type to picker.',
  contentProps:
    'Props for the internally assembled Dropdown.Content, including its accessible name, placement, width and popup ref.',
  optionsProps:
    'Props for the options root div, including native attributes, ref, render, searchLabel, listLabel and emptyLabel. Search matches normalized labels and identifiers, or calling codes with an optional leading plus sign. Surrounding query whitespace is trimmed.',
} satisfies Partial<
  Record<keyof ComponentProps<typeof PhoneCountryPicker>, string>
>;
