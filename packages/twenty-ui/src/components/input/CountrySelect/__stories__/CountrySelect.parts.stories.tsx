import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { CountrySelectPartsExample } from './CountrySelectPartsExample';
import { waitForCountryPopup } from './waitForCountryPopup';

const meta: Meta<typeof CountrySelectPartsExample> = {
  title: 'UI/Components/Input/CountrySelect/Parts',
  component: CountrySelectPartsExample,
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 320, height: 420 },
    a11y: A11Y_DEFER_COLOR_CONTRAST,
  },
  args: { onValueChange: fn() },
};

export default meta;
type Story = StoryObj<typeof CountrySelectPartsExample>;

const assertSelectionParity: NonNullable<Story['play']> = async ({
  canvasElement,
  args,
}) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('button', { name: 'Country' });

  expect(trigger).toHaveTextContent('France');
  await userEvent.click(trigger);
  const popup = await waitForCountryPopup({ canvasElement });
  const choices = within(popup);

  expect(choices.getByRole('option', { name: 'France' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(choices.getByRole('option', { name: 'Canada' })).toBeDisabled();
  await userEvent.keyboard('{ArrowDown}{ArrowDown}');
  expect(args.onValueChange).not.toHaveBeenCalled();
  await userEvent.click(choices.getByRole('option', { name: 'No country' }));
  expect(args.onValueChange).toHaveBeenLastCalledWith(
    null,
    expect.objectContaining({
      reason: 'item-press',
      event: expect.objectContaining({ type: 'click' }),
      trigger: choices.getByRole('option', { name: 'No country' }),
    }),
  );
  await waitFor(() => expect(trigger).toHaveTextContent('No country'));
  await waitFor(() => expect(trigger).toHaveFocus());

  await userEvent.click(trigger);
  const reopened = await waitForCountryPopup({ canvasElement });
  expect(within(reopened).getByRole('searchbox')).toHaveValue('');
  expect(
    within(reopened).getByRole('option', { name: 'No country' }),
  ).toHaveAttribute('aria-selected', 'true');
  await userEvent.click(
    within(reopened).getByRole('option', { name: 'Brésil' }),
  );
  await waitFor(() => expect(trigger).toHaveTextContent('Brésil'));
  expect(args.onValueChange).toHaveBeenLastCalledWith('BR', expect.any(Object));
  await waitFor(() => expect(trigger).toHaveFocus());

  if (!args.controlled) {
    return;
  }

  await userEvent.click(canvas.getByRole('button', { name: 'Apply Japan' }));
  expect(trigger).toHaveTextContent('Japon');
  await userEvent.click(trigger);
  const externalPopup = await waitForCountryPopup({ canvasElement });
  expect(
    within(externalPopup).getByRole('option', { name: 'Japon' }),
  ).toHaveAttribute('aria-selected', 'true');
  await userEvent.keyboard('{Escape}');
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );
  await userEvent.click(
    canvas.getByRole('button', { name: 'Clear externally' }),
  );
  expect(trigger).toHaveTextContent('No country');
  expect(args.onValueChange).toHaveBeenCalledTimes(2);
};

export const ShorthandUncontrolled: Story = { play: assertSelectionParity };
export const CompoundUncontrolled: Story = {
  args: { compound: true },
  play: assertSelectionParity,
};
export const ShorthandControlled: Story = {
  args: { controlled: true },
  play: assertSelectionParity,
};
export const CompoundControlled: Story = {
  args: { compound: true, controlled: true },
  play: assertSelectionParity,
};

const assertCancellation: NonNullable<Story['play']> = async ({
  canvasElement,
  args,
}) => {
  const trigger = within(canvasElement).getByRole('button', {
    name: 'Country',
  });
  await userEvent.click(trigger);
  const popup = await waitForCountryPopup({ canvasElement });
  await userEvent.click(
    within(popup).getByRole('option', { name: 'No country' }),
  );
  expect(args.onValueChange).toHaveBeenCalledWith(
    null,
    expect.objectContaining({ isCanceled: true }),
  );
  expect(trigger).toHaveTextContent('France');
  expect(popup).toBeVisible();
  expect(within(popup).getByRole('option', { name: 'France' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await userEvent.keyboard('{Escape}');
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );
};

export const ShorthandCancellation: Story = {
  args: { cancelSelection: true },
  play: assertCancellation,
};
export const CompoundCancellation: Story = {
  args: { compound: true, cancelSelection: true },
  play: assertCancellation,
};

export const DistinctEmptyAndReservedIdentifiers: Story = {
  args: { compound: true, closeOnSelect: false },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Country',
    });
    await userEvent.click(trigger);
    const popup = await waitForCountryPopup({ canvasElement });
    const choices = within(popup);
    await userEvent.click(
      choices.getByRole('option', { name: 'An empty identifier' }),
    );
    expect(args.onValueChange).toHaveBeenLastCalledWith('', expect.any(Object));
    expect(trigger).toHaveTextContent('An empty identifier');
    expect(choices.getByRole('option', { name: 'No country' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    await userEvent.click(
      choices.getByRole('option', { name: 'A reserved-looking identifier' }),
    );
    expect(args.onValueChange).toHaveBeenLastCalledWith(
      'no-country',
      expect.any(Object),
    );
    expect(trigger).toHaveTextContent('A reserved-looking identifier');
    await userEvent.click(choices.getByRole('option', { name: 'No country' }));
    expect(args.onValueChange).toHaveBeenLastCalledWith(
      null,
      expect.any(Object),
    );
    expect(trigger).toHaveTextContent('No country');
    expect(popup).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'false'),
    );
  },
};

const assertKeptSearchReset: NonNullable<Story['play']> = async ({
  canvasElement,
  args,
}) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('button', { name: 'Country' });
  await userEvent.click(trigger);
  const popup = await waitForCountryPopup({ canvasElement });
  await userEvent.type(within(popup).getByRole('searchbox'), 'bresil');
  expect(within(popup).queryByRole('option', { name: 'France' })).toBeNull();
  await userEvent.keyboard('{Escape}');
  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );
  await userEvent.click(trigger);
  const reopened = await waitForCountryPopup({ canvasElement });
  expect(within(reopened).getByRole('searchbox')).toHaveValue('');
  expect(
    within(reopened).getByRole('option', { name: 'France' }),
  ).toHaveAttribute('aria-selected', 'true');

  if (args.compound) {
    await userEvent.click(
      within(reopened).getByRole('button', { name: 'Disable country picker' }),
    );
  }

  if (!args.compound) {
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'false'),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Toggle disabled' }),
    );
  }

  await waitFor(() =>
    expect(trigger).toHaveAttribute('aria-expanded', 'false'),
  );
  expect(trigger).toHaveAttribute('aria-disabled', 'true');
};

export const ShorthandKeptSearchReset: Story = {
  args: { keepMounted: true },
  play: assertKeptSearchReset,
};
export const CompoundKeptSearchReset: Story = {
  args: { compound: true, keepMounted: true },
  play: assertKeptSearchReset,
};

export const CompoundDisabledHover: Story = {
  args: { compound: true, openOnHover: true, onOpenChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Country' });
    const toggleDisabled = canvas.getByRole('button', {
      name: 'Toggle disabled',
    });

    await userEvent.hover(trigger);
    const popup = await body.findByRole('dialog');
    await waitFor(() => expect(popup).toBeVisible());
    expect(args.onOpenChange).toHaveBeenCalledTimes(1);
    expect(args.onOpenChange).toHaveBeenLastCalledWith(true);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(args.onOpenChange).toHaveBeenCalledTimes(2);
    expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await userEvent.unhover(trigger);
    await userEvent.click(toggleDisabled);
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    expect(trigger).not.toBeDisabled();
    await userEvent.hover(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(args.onOpenChange).toHaveBeenCalledTimes(2);
    await userEvent.unhover(trigger);
    await userEvent.click(toggleDisabled);
    expect(trigger).not.toHaveAttribute('aria-disabled');
    await userEvent.hover(trigger);
    const reopenedPopup = await body.findByRole('dialog');
    await waitFor(() => expect(reopenedPopup).toBeVisible());
    expect(args.onOpenChange).toHaveBeenCalledTimes(3);
    expect(args.onOpenChange).toHaveBeenLastCalledWith(true);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(reopenedPopup).not.toBeInTheDocument());
  },
};
