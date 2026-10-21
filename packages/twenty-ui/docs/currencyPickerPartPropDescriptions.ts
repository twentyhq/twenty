import { type CurrencyPickerOptionsProps } from '../src/components/input/CurrencyPicker/types/CurrencyPickerOptionsProps';
import { CURRENCY_PICKER_ROOT_PROP_DESCRIPTIONS } from './currencyPickerRootPropDescriptions';
import { CURRENCY_PICKER_TRIGGER_PROP_DESCRIPTIONS } from './currencyPickerTriggerPropDescriptions';

export const CURRENCY_PICKER_PART_PROP_DESCRIPTIONS = {
  Root: CURRENCY_PICKER_ROOT_PROP_DESCRIPTIONS,
  Trigger: CURRENCY_PICKER_TRIGGER_PROP_DESCRIPTIONS,
  Options: {
    searchable: 'Renders a search input above the options. Defaults to true.',
    searchProps:
      'Native input attributes, ref, render, and controlled or uncontrolled query props forwarded to Dropdown.Search. Use value with onValueChange or defaultValue.',
    searchLabel: 'Search placeholder and accessible name. Defaults to Search.',
    listLabel:
      'Accessible name for the selection listbox. Defaults to the registered Dropdown title or trigger name. Native accessible attributes on Options target only its wrapper.',
    emptyLabel:
      'Content announced when no currencies match. Defaults to No results.',
    disabled:
      'Additionally disables search and every currency option. Root disabled state always takes precedence.',
    className: 'Class applied to the options wrapper div.',
    style: 'Inline styles applied to the options wrapper div.',
    ref: 'Ref to the options wrapper div, or the element composed through render.',
    render:
      'Replaces the non-interactive wrapper div. Forward the supplied props and ref when rendering a custom component. Use searchProps.render to customize the input.',
  } satisfies Partial<Record<keyof CurrencyPickerOptionsProps, string>>,
};
