import { type ComponentProps } from 'react';

import { type PhoneCountryPicker } from '../src/components/input/PhoneCountryPicker/PhoneCountryPicker';

export const PHONE_COUNTRY_PICKER_PART_PROP_DESCRIPTIONS = {
  Root: {
    countries:
      'Prepared choices shared by Trigger and Options, with unique stable values, localized labels, digits-only calling codes without a plus sign, decorative flag nodes and optional disabled states.',
    value:
      'Controlled country identifier shared by the parts. Use null to clear the selection.',
    defaultValue:
      'Initial uncontrolled country identifier. Omit it or use null to start empty.',
    onValueChange:
      'Receives the requested identifier or null and Dropdown.SelectionGroup event details, including reason, event, trigger and cancel(). Cancel before updating controlled state to reject a selection.',
    disabled: 'Disables the composed trigger, search and country selection.',
    closeOnSelect:
      'Closes the composed Dropdown after an accepted selection. Defaults to true.',
    children:
      'A Dropdown.Root with type="picker", its Trigger, Content and Options. Root shares prepared data and selection and renders no DOM node.',
  } satisfies Partial<
    Record<keyof ComponentProps<typeof PhoneCountryPicker.Root>, string>
  >,
  Trigger: {
    'aria-label': 'Required accessible name for the country selector button.',
    children:
      'Optional trigger content replacing the selected country flag or empty world icon and chevron. The selected label comes from Root.',
    disabled:
      'Disables the native trigger button in addition to Root.disabled.',
    ref: 'Ref to the trigger button, or the element composed through render.',
    render:
      'Composes the Dropdown trigger with an element or render callback. Native attributes, handlers, className, style and ref target this element.',
  } satisfies Partial<
    Record<keyof ComponentProps<typeof PhoneCountryPicker.Trigger>, string>
  >,
  Options: {
    listLabel:
      'Accessible name of the country listbox, separate from the search field. Defaults to Countries.',
    searchLabel:
      'Accessible name and placeholder of the country search field. Defaults to Search. Search matches normalized labels and identifiers, or calling codes with an optional leading plus sign. Surrounding query whitespace is trimmed.',
    emptyLabel:
      'Status message shown when no country label, identifier or calling code matches. Defaults to No results.',
    disabled: 'Disables search and selection in addition to Root.disabled.',
    ref: 'Ref to the options root div, or the element composed through render.',
    render:
      'Composes the non-interactive options root with an element or render callback. Native attributes, handlers, className, style and ref target this element. searchLabel names the internal search input.',
  } satisfies Partial<
    Record<keyof ComponentProps<typeof PhoneCountryPicker.Options>, string>
  >,
};
