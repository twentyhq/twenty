import { type Meta, type StoryObj } from '@storybook/react-vite';
import { createRef } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Text } from '@ui/primitives/typography/Text/Text';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { CurrencyPicker } from '../CurrencyPicker';
import { type CurrencyPickerChangeEventDetails } from '../types/CurrencyPickerChangeEventDetails';
import { CurrencyPickerChangingDefaultExample } from './CurrencyPickerChangingDefaultExample';
import { CurrencyPickerControlledExample } from './CurrencyPickerControlledExample';
import { CurrencyPickerControlledSearchExample } from './CurrencyPickerControlledSearchExample';
import { CurrencyPickerExample } from './CurrencyPickerExample';
import { CurrencyPickerListLabelExample } from './CurrencyPickerListLabelExample';
import { CurrencyPickerRootStateExample } from './CurrencyPickerRootStateExample';
import { CURRENCY_PICKER_STORY_OPTIONS } from './currencyPickerStoryOptions';
import { openCurrencyPicker } from './openCurrencyPicker';

const meta: Meta<typeof CurrencyPickerExample> = {
  id: 'ui-input-currencypicker-api',
  title: 'UI/Components/Input/CurrencyPicker/API',
  component: CurrencyPickerExample,
  render: (args) => (
    <CurrencyPickerExample
      key={args.defaultValue}
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...args}
    />
  ),
  decorators: [ComponentDecorator],
  args: { onValueChange: fn() },
  parameters: {
    container: { width: 360, height: 420 },
    a11y: A11Y_DEFER_COLOR_CONTRAST,
  },
};

export default meta;
type Story = StoryObj<typeof CurrencyPickerExample>;

const nativeSearchRef = createRef<HTMLInputElement>();

export const ControlledExternalUpdates: Story = {
  render: (args) => (
    <CurrencyPickerControlledExample
      composition={args.composition}
      onValueChange={args.onValueChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Currency' });

    await expect(trigger.textContent).toBe('USD');
    await userEvent.click(canvas.getByRole('button', { name: 'Set Euro' }));
    await expect(trigger).toHaveTextContent('EUR');
    const selectedPicker = await openCurrencyPicker({ canvasElement });

    await expect(
      within(selectedPicker.dialog).getByRole('listbox', { name: 'Currency' }),
    ).toHaveAttribute('aria-labelledby', trigger.id);

    await expect(
      within(selectedPicker.dialog).getByRole('option', { name: 'Euro (EUR)' }),
    ).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(selectedPicker.dialog).not.toBeInTheDocument());

    for (const { buttonLabel, expectedLabel } of [
      { buttonLabel: 'Clear currency', expectedLabel: '' },
      { buttonLabel: 'Set unknown currency', expectedLabel: 'ZZZ' },
      { buttonLabel: 'Set empty identifier', expectedLabel: '' },
    ]) {
      await userEvent.click(canvas.getByRole('button', { name: buttonLabel }));
      await expect(trigger.textContent).toBe(expectedLabel);
      const picker = await openCurrencyPicker({ canvasElement });

      await expect(
        within(picker.dialog).queryAllByRole('option', { selected: true }),
      ).toHaveLength(0);
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(picker.dialog).not.toBeInTheDocument());
    }

    await expect(args.onValueChange).not.toHaveBeenCalled();
    const picker = await openCurrencyPicker({ canvasElement });
    await userEvent.click(
      within(picker.dialog).getByRole('option', {
        name: 'Australian Dollar (AUD)',
      }),
    );
    await waitFor(() => expect(picker.dialog).not.toBeInTheDocument());
    await expect(trigger).toHaveTextContent('AUD');
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'AUD',
      expect.objectContaining({ reason: 'item-press', isCanceled: false }),
    );
  },
};

export const CompoundControlledExternalUpdates: Story = {
  ...ControlledExternalUpdates,
  args: { composition: 'compound' },
};

export const CanceledSelection: Story = {
  args: {
    onValueChange: fn(
      (_value: string | null, eventDetails: CurrencyPickerChangeEventDetails) =>
        eventDetails.cancel(),
    ),
  },
  play: async ({ canvasElement, args }) => {
    const { trigger, dialog, search } = await openCurrencyPicker({
      canvasElement,
    });
    const euro = within(dialog).getByRole('option', { name: 'Euro (EUR)' });

    await userEvent.click(euro);
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'EUR',
      expect.objectContaining({
        reason: 'item-press',
        event: expect.objectContaining({ type: 'click', target: euro }),
        trigger: euro,
        isCanceled: true,
      }),
    );
    await expect(trigger).toHaveTextContent('USD');
    await expect(dialog).toBeVisible();
    await expect(euro).toHaveAttribute('aria-selected', 'false');
    await userEvent.type(search, 'euro');
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      'EUR',
      expect.objectContaining({
        reason: 'item-press',
        event: expect.objectContaining({
          key: 'Enter',
          shiftKey: true,
          target: search,
        }),
        trigger: euro,
        isCanceled: true,
      }),
    );
    await expect(args.onValueChange).toHaveBeenCalledTimes(2);
    await expect(trigger).toHaveTextContent('USD');
    await expect(dialog).toBeVisible();
  },
};

export const CompoundCanceledSelection: Story = {
  ...CanceledSelection,
  args: {
    composition: 'compound',
    onValueChange: fn(
      (_value: string | null, eventDetails: CurrencyPickerChangeEventDetails) =>
        eventDetails.cancel(),
    ),
  },
};

export const SelectedFirstIsExplicit: Story = {
  args: { selectedFirst: true },
  play: async ({ canvasElement }) => {
    const { dialog } = await openCurrencyPicker({ canvasElement });

    await expect(within(dialog).getAllByRole('option')[0]).toHaveTextContent(
      'US Dollar (USD)',
    );
  },
};

export const CallerPresentationAndSearch: Story = {
  args: {
    defaultValue: 'EUR',
    currencies: [
      { code: 'USD', name: 'Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
    ],
    getOptionLabel: (currency) => (
      <Text>
        {currency.symbol} {currency.name}
      </Text>
    ),
    getSearchText: (currency) =>
      `${currency.code} ${currency.name} ${currency.symbol}`,
    renderValue: ({ selectedCurrency, value }) =>
      selectedCurrency?.symbol ?? value,
  },
  play: async ({ canvasElement, args }) => {
    const { trigger, dialog, search } = await openCurrencyPicker({
      canvasElement,
    });

    await expect(trigger).toHaveTextContent('€');
    await userEvent.type(search, '$');
    await expect(within(dialog).getAllByRole('option')).toHaveLength(1);
    await userEvent.click(
      within(dialog).getByRole('option', { name: '$ Dollar' }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(trigger).toHaveTextContent('$');
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'USD',
      expect.objectContaining({ reason: 'item-press' }),
    );
  },
};

export const CompoundCallerPresentationAndSearch: Story = {
  ...CallerPresentationAndSearch,
  args: { ...CallerPresentationAndSearch.args, composition: 'compound' },
};

export const EmptyCurrencies: Story = {
  args: {
    currencies: [],
    defaultValue: null,
    emptyLabel: 'No currencies available',
  },
  play: async ({ canvasElement, args }) => {
    const { dialog, search } = await openCurrencyPicker({ canvasElement });

    await expect(within(dialog).queryAllByRole('option')).toHaveLength(0);
    await expect(within(dialog).getByRole('status')).toHaveTextContent(
      'No currencies available',
    );
    await userEvent.type(search, 'EUR');
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(dialog).toBeVisible();
  },
};

export const SearchDisabledUsesSelectedOpeningFocus: Story = {
  args: { searchable: false, defaultValue: 'EUR' },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Currency' }),
    );
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
      { name: 'Currency' },
    );
    const euro = within(dialog).getByRole('option', { name: 'Euro (EUR)' });

    await expect(
      within(dialog).queryByRole('searchbox'),
    ).not.toBeInTheDocument();
    await waitFor(() => expect(euro).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}');
    const japaneseYen = within(dialog).getByRole('option', {
      name: 'Japanese Yen (JPY)',
    });
    await expect(japaneseYen).toHaveFocus();
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard(' ');
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'JPY',
      expect.objectContaining({ reason: 'item-press' }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};

export const EmptyIdentifierIsSelectable: Story = {
  args: {
    defaultValue: 'USD',
    currencies: [
      { code: '', name: 'No currency' },
      { code: 'USD', name: 'US Dollar' },
    ],
    getOptionLabel: (currency) => currency.name,
  },
  play: async ({ canvasElement, args }) => {
    const { trigger, dialog } = await openCurrencyPicker({ canvasElement });

    await userEvent.click(
      within(dialog).getByRole('option', { name: 'No currency' }),
    );
    await expect(args.onValueChange).toHaveBeenCalledWith(
      '',
      expect.objectContaining({ reason: 'item-press', isCanceled: false }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(trigger.textContent).toBe('');
    const reopenedPicker = await openCurrencyPicker({ canvasElement });

    await expect(
      within(reopenedPicker.dialog).getByRole('option', {
        name: 'No currency',
      }),
    ).toHaveAttribute('aria-selected', 'true');
  },
};

export const UnknownDefaultValue: Story = {
  args: { defaultValue: 'ZZZ' },
  play: async ({ canvasElement, args }) => {
    const { trigger, dialog, search } = await openCurrencyPicker({
      canvasElement,
    });

    await expect(trigger).toHaveTextContent('ZZZ');
    await expect(
      within(dialog).queryAllByRole('option', { selected: true }),
    ).toHaveLength(0);
    await userEvent.type(search, 'eur');
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'EUR',
      expect.objectContaining({ reason: 'item-press', isCanceled: false }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(trigger).toHaveTextContent('EUR');
  },
};

export const DefaultSearchAndPersistentSelection: Story = {
  args: {
    closeOnSelect: false,
    searchProps: { defaultValue: 'yen' },
  },
  play: async ({ canvasElement, args }) => {
    const { trigger, dialog, search } = await openCurrencyPicker({
      canvasElement,
    });
    const japaneseYen = within(dialog).getByRole('option', {
      name: 'Japanese Yen (JPY)',
    });

    await expect(search).toHaveValue('yen');
    await expect(within(dialog).getAllByRole('option')).toHaveLength(1);
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'JPY',
      expect.objectContaining({ reason: 'item-press', isCanceled: false }),
    );
    await expect(trigger).toHaveTextContent('JPY');
    await expect(dialog).toBeVisible();
    await expect(japaneseYen).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(japaneseYen);
    await expect(args.onValueChange).toHaveBeenCalledOnce();
    await expect(dialog).toBeVisible();
    await userEvent.clear(search);
    await expect(within(dialog).getAllByRole('option')).toHaveLength(5);
    await expect(japaneseYen).toHaveAttribute('aria-selected', 'true');
  },
};

export const CompoundDefaultSearchAndPersistentSelection: Story = {
  ...DefaultSearchAndPersistentSelection,
  args: {
    ...DefaultSearchAndPersistentSelection.args,
    composition: 'compound',
  },
};

export const ControlledSearchQuery: Story = {
  render: (args) => (
    <CurrencyPickerControlledSearchExample
      composition={args.composition}
      onValueChange={args.onValueChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Find Euro' }));
    const picker = await openCurrencyPicker({ canvasElement });

    await expect(picker.search).toHaveValue('EUR');
    await expect(within(picker.dialog).getAllByRole('option')).toHaveLength(1);
    await expect(
      within(picker.dialog).getByRole('option'),
    ).toHaveAccessibleName('Euro (EUR)');
    await userEvent.clear(picker.search);
    await expect(picker.search).toHaveValue('');
    await expect(within(picker.dialog).getAllByRole('option')).toHaveLength(5);
    await userEvent.type(picker.search, 'jpy');
    await expect(picker.search).toHaveValue('jpy');
    await expect(within(picker.dialog).getAllByRole('option')).toHaveLength(1);
    await userEvent.keyboard('{Enter}');
    await expect(picker.trigger).toHaveTextContent('JPY');
    await expect(picker.dialog).toBeVisible();
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'JPY',
      expect.objectContaining({ reason: 'item-press', isCanceled: false }),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(picker.dialog).not.toBeInTheDocument());
    await userEvent.click(canvas.getByRole('button', { name: 'Find Euro' }));
    const reopenedPicker = await openCurrencyPicker({ canvasElement });
    const euro = within(reopenedPicker.dialog).getByRole('option', {
      name: 'Euro (EUR)',
    });

    await expect(reopenedPicker.search).toHaveValue('EUR');
    await expect(reopenedPicker.trigger).toHaveTextContent('JPY');
    await expect(euro).toHaveAttribute('aria-selected', 'false');
    await userEvent.click(euro);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      'EUR',
      expect.objectContaining({ reason: 'item-press', isCanceled: false }),
    );
    await expect(args.onValueChange).toHaveBeenCalledTimes(2);
    await expect(reopenedPicker.trigger).toHaveTextContent('EUR');
    await expect(reopenedPicker.dialog).toBeVisible();
  },
};

export const CompoundControlledSearchQuery: Story = {
  ...ControlledSearchQuery,
  args: { composition: 'compound' },
};

export const DefaultChangesBeforeOpening: Story = {
  render: (args) => (
    <CurrencyPickerChangingDefaultExample
      composition={args.composition}
      onValueChange={args.onValueChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Currency' });

    await expect(trigger).toHaveTextContent('USD');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change default to Euro' }),
    );
    await expect(trigger).toHaveTextContent('USD');
    const picker = await openCurrencyPicker({ canvasElement });

    await expect(
      within(picker.dialog).getByRole('option', { name: 'US Dollar (USD)' }),
    ).toHaveAttribute('aria-selected', 'true');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.click(
      within(picker.dialog).getByRole('option', {
        name: 'Australian Dollar (AUD)',
      }),
    );
    await waitFor(() => expect(picker.dialog).not.toBeInTheDocument());
    await expect(trigger).toHaveTextContent('AUD');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change default to Yen' }),
    );
    await expect(trigger).toHaveTextContent('AUD');
    const reopenedPicker = await openCurrencyPicker({ canvasElement });

    await expect(
      within(reopenedPicker.dialog).getByRole('option', {
        name: 'Australian Dollar (AUD)',
      }),
    ).toHaveAttribute('aria-selected', 'true');
    await expect(args.onValueChange).toHaveBeenCalledOnce();
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'AUD',
      expect.objectContaining({ reason: 'item-press', isCanceled: false }),
    );
  },
};

export const CompoundDefaultChangesBeforeOpening: Story = {
  ...DefaultChangesBeforeOpening,
  args: { composition: 'compound' },
};

export const PreparedRootState: Story = {
  render: () => <CurrencyPickerRootStateExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const host = canvas.getByTestId('root-host');
    const rootState = canvas.getByTestId('root-state');

    await expect(rootState).toHaveTextContent('USD:US Dollar:true');
    await expect(host.children).toHaveLength(1);
    await expect(host.firstElementChild).toBe(rootState);
    await userEvent.click(canvas.getByRole('button', { name: 'Use Euro' }));
    await expect(rootState).toHaveTextContent('EUR:Euro:false');
    await expect(host.firstElementChild).toBe(rootState);
  },
};

export const NativeTargets: Story = {
  render: () => (
    <CurrencyPicker
      currencies={CURRENCY_PICKER_STORY_OPTIONS}
      defaultValue={null}
      placeholder="Choose currency"
      title="Top level trigger title"
      triggerProps={{ title: 'Trigger title', 'aria-label': 'Currency' }}
      optionsProps={{
        title: 'Options title',
        'aria-label': 'Options wrapper',
        listLabel: 'Supported currencies',
        render: <section data-options-render="native" />,
        searchProps: {
          ref: nativeSearchRef,
          title: 'Search title',
          'aria-label': 'Find a currency',
          render: <input data-search-render="native" />,
        },
      }}
      contentProps={{
        'aria-label': 'Available currencies',
        title: 'Popup title',
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Currency' });

    await expect(trigger.textContent).toBe('Choose currency');
    await expect(trigger).toHaveAttribute('title', 'Trigger title');
    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
      { name: 'Available currencies' },
    );
    const options = within(dialog).getByTitle('Options title');
    const search = within(dialog).getByRole('searchbox', {
      name: 'Find a currency',
    });

    await expect(dialog).toHaveAttribute('title', 'Popup title');
    await expect(options.tagName).toBe('SECTION');
    await expect(options).toHaveAttribute('aria-label', 'Options wrapper');
    const listbox = within(dialog).getByRole('listbox', {
      name: 'Supported currencies',
    });

    await expect(listbox).toHaveAttribute('aria-label', 'Supported currencies');
    await expect(listbox).not.toHaveAttribute('aria-labelledby');
    await expect(options).toHaveAttribute('data-options-render', 'native');
    await expect(search).toHaveAttribute('title', 'Search title');
    await expect(search).toHaveAttribute('data-search-render', 'native');
    await expect(nativeSearchRef.current).toBe(search);
    await waitFor(() => expect(search).toHaveFocus());
    await userEvent.type(search, 'EUR');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(trigger).toHaveTextContent('EUR');
    await expect(nativeSearchRef.current).toBeNull();
  },
};

export const ListLabelUsesTitleThenTrigger: Story = {
  render: () => <CurrencyPickerListLabelExample />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Billing currency',
    });

    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
      { name: 'Currency options' },
    );
    const listbox = within(dialog).getByRole('listbox', {
      name: 'Billing currencies',
    });
    const title = within(dialog).getByText('Billing currencies');
    const options = within(dialog).getByLabelText('Currency options wrapper');

    await expect(listbox).toHaveAttribute('aria-labelledby', title.id);
    await expect(listbox).not.toHaveAttribute('aria-label');
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Hide title' }),
    );
    await waitFor(() =>
      expect(listbox).toHaveAccessibleName('Billing currency'),
    );
    await expect(listbox).toHaveAttribute('aria-labelledby', trigger.id);
    await expect(options).toHaveAttribute(
      'aria-label',
      'Currency options wrapper',
    );
    await userEvent.click(
      within(listbox).getByRole('option', { name: 'Euro (EUR)' }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(trigger).toHaveTextContent('EUR');
  },
};
