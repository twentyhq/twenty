import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { CurrencyPickerExample } from './CurrencyPickerExample';
import { openCurrencyPicker } from './openCurrencyPicker';

const meta: Meta<typeof CurrencyPickerExample> = {
  id: 'ui-input-currencypicker-interactions',
  title: 'UI/Components/Input/CurrencyPicker/Interactions',
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
    container: { width: 320, height: 340 },
    a11y: A11Y_DEFER_COLOR_CONTRAST,
  },
};

export default meta;
type Story = StoryObj<typeof CurrencyPickerExample>;

export const SearchAndPointerSelection: Story = {
  play: async ({ canvasElement, args }) => {
    const { trigger, dialog, search } = await openCurrencyPicker({
      canvasElement,
    });
    const options = within(dialog);

    await expect(options.getAllByRole('option')[0]).toHaveTextContent(
      'Australian Dollar (AUD)',
    );
    await expect(
      options.getByRole('option', { name: 'US Dollar (USD)' }),
    ).toHaveAttribute('aria-selected', 'true');
    await userEvent.type(search, 'dOlLaR');
    await expect(options.getAllByRole('option')).toHaveLength(2);
    await expect(options.getAllByRole('option')[0]).toHaveTextContent(
      'Australian Dollar (AUD)',
    );
    await userEvent.clear(search);
    await userEvent.type(search, 'eUr');
    await expect(options.getAllByRole('option')).toHaveLength(1);
    await expect(
      options.queryByRole('option', { name: 'US Dollar (USD)' }),
    ).not.toBeInTheDocument();
    await userEvent.clear(search);
    await userEvent.type(search, ' eUr ');
    await expect(options.getAllByRole('option')).toHaveLength(1);
    await expect(options.getByRole('option')).toHaveAccessibleName(
      'Euro (EUR)',
    );
    await userEvent.clear(search);
    await userEvent.type(search, 'Euro (EUR)');
    await expect(options.getAllByRole('option')).toHaveLength(1);
    await userEvent.click(options.getByRole('option', { name: 'Euro (EUR)' }));
    await expect(args.onValueChange).toHaveBeenCalledOnce();
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'EUR',
      expect.objectContaining({ reason: 'item-press', isCanceled: false }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(trigger).toHaveTextContent('EUR');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const KeyboardNavigation: Story = {
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Currency',
    });

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
      { name: 'Currency' },
    );
    const search = within(dialog).getByRole('searchbox');

    await waitFor(() => expect(dialog).toBeVisible());
    await waitFor(() => expect(search).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowDown}');
    await expect(
      within(dialog).getByRole('option', { name: 'Australian Dollar (AUD)' }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(
      within(dialog).getByRole('option', { name: 'Euro (EUR)' }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(
      within(dialog).getByRole('option', { name: 'Japanese Yen (JPY)' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(
      within(dialog).getByRole('option', { name: 'Australian Dollar (AUD)' }),
    ).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(
      within(dialog).getByRole('option', { name: 'US Dollar (USD)' }),
    ).toHaveFocus();
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{ArrowUp}{Enter}');
    await expect(args.onValueChange).toHaveBeenCalledOnce();
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'JPY',
      expect.objectContaining({ reason: 'item-press', isCanceled: false }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const MatchingSearchEnter: Story = {
  play: async ({ canvasElement, args }) => {
    const { trigger, dialog, search } = await openCurrencyPicker({
      canvasElement,
    });

    await userEvent.type(search, 'jApAn');
    const japaneseYen = within(dialog).getByRole('option', {
      name: 'Japanese Yen (JPY)',
    });

    await waitFor(() =>
      expect(japaneseYen).toHaveAttribute('data-highlighted'),
    );
    await expect(search).toHaveAttribute(
      'aria-activedescendant',
      japaneseYen.id,
    );
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenCalledOnce();
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'JPY',
      expect.objectContaining({ reason: 'item-press', isCanceled: false }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(trigger).toHaveTextContent('JPY');
  },
};

export const EmptyResultsAndLabelOverrides: Story = {
  args: {
    searchLabel: 'Find a currency',
    emptyLabel: 'No matching currencies',
  },
  play: async ({ canvasElement, args }) => {
    const { trigger, dialog, search } = await openCurrencyPicker({
      canvasElement,
    });

    await expect(search).toHaveAccessibleName('Find a currency');
    await expect(search).toHaveAttribute('placeholder', 'Find a currency');
    const emptyStatus = within(dialog).getByRole('status');

    await expect(emptyStatus).toBeEmptyDOMElement();
    await userEvent.type(search, 'unknown');
    await expect(within(dialog).queryAllByRole('option')).toHaveLength(0);
    await expect(emptyStatus).toHaveTextContent('No matching currencies');
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(search).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const DisabledCurrency: Story = {
  play: async ({ canvasElement, args }) => {
    const { trigger, dialog, search } = await openCurrencyPicker({
      canvasElement,
    });
    const disabledCurrency = within(dialog).getByRole('option', {
      name: 'British Pound (GBP)',
    });

    await expect(disabledCurrency).toBeDisabled();
    await userEvent.click(disabledCurrency);
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.type(search, 'pound');
    await expect(search).not.toHaveAttribute('aria-activedescendant');
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.clear(search);
    await userEvent.type(search, 'jpy');
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenCalledOnce();
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'JPY',
      expect.objectContaining({ reason: 'item-press', isCanceled: false }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const DisabledTrigger: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Currency',
    });

    await expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    await userEvent.tab();
    await expect(trigger).not.toHaveFocus();
    await expect(
      within(canvasElement.ownerDocument.body).queryByRole('dialog'),
    ).not.toBeInTheDocument();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const DisabledOptions: Story = {
  args: { optionsDisabled: true },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Currency',
    });

    await userEvent.click(trigger);
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
      { name: 'Currency' },
    );

    await waitFor(() => expect(dialog).toBeVisible());
    await expect(within(dialog).getByRole('searchbox')).toBeDisabled();
    for (const option of within(dialog).getAllByRole('option')) {
      await expect(option).toBeDisabled();
    }
    await userEvent.click(
      within(dialog).getByRole('option', { name: 'Euro (EUR)' }),
    );
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  },
};

export const IndependentInstances: Story = {
  render: () => (
    <>
      <CurrencyPickerExample
        triggerLabel="Invoice currency"
        defaultValue="USD"
      />
      <CurrencyPickerExample
        triggerLabel="Budget currency"
        defaultValue="EUR"
      />
    </>
  ),
  play: async ({ canvasElement }) => {
    const invoice = await openCurrencyPicker({
      canvasElement,
      triggerLabel: 'Invoice currency',
    });

    await userEvent.type(invoice.search, 'jpy');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(invoice.dialog).not.toBeInTheDocument());

    const budget = await openCurrencyPicker({
      canvasElement,
      triggerLabel: 'Budget currency',
    });

    await expect(budget.search).toHaveValue('');
    await expect(budget.trigger).toHaveTextContent('EUR');
    await expect(
      within(budget.dialog).getByRole('option', { name: 'Euro (EUR)' }),
    ).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(budget.dialog).not.toBeInTheDocument());

    const reopenedInvoice = await openCurrencyPicker({
      canvasElement,
      triggerLabel: 'Invoice currency',
    });

    await expect(reopenedInvoice.search).toHaveValue('');
    await expect(reopenedInvoice.trigger).toHaveTextContent('JPY');
    await expect(
      within(reopenedInvoice.dialog).getByRole('option', {
        name: 'Japanese Yen (JPY)',
      }),
    ).toHaveAttribute('aria-selected', 'true');
  },
};

export const OutsideDismissal: Story = {
  render: (args) => (
    <>
      <CurrencyPickerExample
        key={args.defaultValue}
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...args}
      />
      <Button>Continue</Button>
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const { dialog } = await openCurrencyPicker({ canvasElement });

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Continue' }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const CompoundSearchAndPointerSelection: Story = {
  ...SearchAndPointerSelection,
  args: { composition: 'compound' },
};

export const CompoundKeyboardNavigation: Story = {
  ...KeyboardNavigation,
  args: { composition: 'compound' },
};
