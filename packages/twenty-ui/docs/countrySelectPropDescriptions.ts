import { type CountrySelectProps } from '../src/components/input/CountrySelect/types/CountrySelectProps';

export const COUNTRY_SELECT_PROP_DESCRIPTIONS = {
  countries:
    'Prepared country choices with unique stable string values, caller-owned labels, and optional decorative flags and disabled states. An empty string is a valid choice value.',
  value:
    'Controlled selected identifier. Null selects no country; undefined leaves selection uncontrolled.',
  defaultValue: 'Initial uncontrolled selected identifier. Defaults to null.',
  onValueChange:
    'Reports the selected identifier or null with cancellable event details. Call details.cancel() to preserve selection and keep the popup open.',
  label: 'Optional visible label that names the trigger.',
  children:
    'Custom trigger content. Replaces the selected country presentation while retaining shared trigger behavior.',
  searchLabel: 'Placeholder and accessible name of the search input.',
  noCountryLabel:
    'Text of the no-country choice, also displayed when no country is selected.',
  noResultsLabel: 'Text displayed when no choice matches the search.',
  searchProps:
    'Native search input props, ref, and render. Search value and change handling are owned by the picker.',
  closeOnSelect:
    'Closes the popup after a selection. Defaults to true. Cancelled selection keeps it open.',
  optionsProps:
    'Native props, ref, and render for the selection group div rendered by CountrySelect.Options.',
  open: 'Controls whether the country popup is open.',
  defaultOpen: 'Whether the uncontrolled popup is initially open.',
  onOpenChange:
    'Reports popup opening and closing with the next boolean state, matching Dropdown.Root.',
  onEscapeKeyDown:
    'Called before Escape dismisses the popup. Call event.preventDefault() to keep it open.',
  onInteractOutside:
    'Called before outside interaction or Tab dismisses the popup. Call event.preventDefault() to keep it open.',
  defaultPage: 'Dropdown page shown when the popup opens. Defaults to root.',
  popupProps:
    'Dropdown.Content props, including native popup attributes, ref, render, positioning, portal destination, and keepMounted. Explicit popup accessible names override the trigger name. Children are owned by the picker.',
  wrapperProps:
    'Native props and ref for the div around the trigger and its visible label. Children are owned by the picker.',
  id: 'ID of the trigger. Generated when omitted.',
  className: 'Class applied to the trigger.',
  disabled:
    'Prevents opening and selection while the trigger stays focusable. An empty country list is also disabled.',
  render:
    'Replaces the trigger element while preserving its behavior and props.',
  ref: 'Ref to the trigger element.',
} satisfies Partial<Record<keyof CountrySelectProps, string>>;
