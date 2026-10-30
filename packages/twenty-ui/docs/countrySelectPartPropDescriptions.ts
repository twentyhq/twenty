import { type ComponentProps } from 'react';

import { type CountrySelect } from '../src/components/input/CountrySelect/CountrySelect';

export const COUNTRY_SELECT_PART_PROP_DESCRIPTIONS = {
  Root: {
    countries:
      'Prepared country choices with unique stable string values, caller-owned labels, and optional decorative flags and disabled states. An empty string is a valid choice value.',
    value:
      'Controlled selected identifier. Null selects no country; undefined leaves selection uncontrolled.',
    defaultValue: 'Initial uncontrolled selected identifier. Defaults to null.',
    onValueChange:
      'Reports the selected identifier or null with event, reason, trigger, cancel and isCanceled details. Call cancel() to preserve selection and keep the popup open.',
    noCountryLabel:
      'Text for the null selection and its option. Defaults to No country.',
    disabled:
      'Prevents opening and selection. An empty country list is also disabled. The trigger stays focusable with aria-disabled.',
    children:
      'Picker composition containing Dropdown.Root, CountrySelect.Trigger, and CountrySelect.Options. Root adds no DOM element.',
  } satisfies Partial<
    Record<keyof ComponentProps<typeof CountrySelect.Root>, string>
  >,
  Trigger: {
    label: 'Optional visible label that names the trigger.',
    children:
      'Custom trigger content. Replaces the selected country presentation while retaining shared trigger behavior.',
    wrapperProps:
      'Native props and ref for the div around the trigger and its visible label. Children are owned by the picker.',
    className: 'Class applied to the trigger button.',
    render:
      'Replaces the trigger element. Custom components must forward the supplied props and ref.',
    ref: 'Ref to the trigger element.',
  } satisfies Partial<
    Record<keyof ComponentProps<typeof CountrySelect.Trigger>, string>
  >,
  Options: {
    'aria-label':
      'Accessible name for the selection listbox. Overrides its default name.',
    'aria-labelledby':
      'Accessible name references for the selection listbox. Defaults to the registered Dropdown title or trigger element.',
    closeOnSelect:
      'Closes the popup after a selection. Defaults to true. Cancelled selection keeps it open.',
    searchLabel: 'Search placeholder and accessible name. Defaults to Search.',
    noResultsLabel:
      'Text displayed when no choice matches the search. Defaults to No results.',
    searchProps:
      'Native search input props, ref, and render. Search value and change handling are owned by the picker.',
    className: 'Class applied to the selection group div.',
    render:
      'Replaces the selection group div. Functions receive supplied props and { value, multiple: false } state, with the public string or null selection. Custom components must forward the supplied props and ref.',
    ref: 'Ref to the selection group element.',
  } satisfies Partial<
    Record<keyof ComponentProps<typeof CountrySelect.Options>, string>
  >,
};
