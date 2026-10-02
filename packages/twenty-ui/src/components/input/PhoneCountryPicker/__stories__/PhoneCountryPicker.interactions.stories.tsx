import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator } from '@ui/testing';

import { PhoneCountryPickerExample } from './PhoneCountryPickerExample';
import { openPhoneCountryPicker } from './openPhoneCountryPicker';
import { PHONE_COUNTRY_PICKER_STORY_A11Y_PARAMETERS } from './phoneCountryPickerStoryA11yParameters';

const meta: Meta<typeof PhoneCountryPickerExample> = {
  title: 'UI/Input/PhoneCountryPicker/Interactions',
  component: PhoneCountryPickerExample,
  render: (args) => (
    <PhoneCountryPickerExample key={args.initialValue} {...args} />
  ),
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 360, height: 360 },
    a11y: PHONE_COUNTRY_PICKER_STORY_A11Y_PARAMETERS,
  },
};

export default meta;
type Story = StoryObj<typeof PhoneCountryPickerExample>;

export const CountryNameSearch: Story = {
  args: { onValueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const { dialog, search } = await openPhoneCountryPicker({ canvasElement });

    await userEvent.type(search, 'a');
    await expect(
      within(dialog)
        .getAllByRole('button')
        .map((choice) => choice.textContent),
    ).toEqual([
      expect.stringContaining('France (+33)'),
      expect.stringContaining('Canada (+1)'),
      expect.stringContaining('Germany (+49)'),
      expect.stringContaining('United States (+1)'),
    ]);
    await userEvent.clear(search);
    await userEvent.type(search, 'uNiTeD');
    await expect(within(dialog).getAllByRole('button')).toHaveLength(2);
    await expect(
      within(dialog).queryByRole('button', { name: 'France (+33)' }),
    ).not.toBeInTheDocument();
    await expect(within(dialog).getAllByRole('button')[0]).toHaveAccessibleName(
      'United Kingdom (+44)',
    );

    for (const query of [' France ', '+33', '33', 'GB', 'unknown']) {
      await userEvent.clear(search);
      await userEvent.type(search, query);
      await expect(within(dialog).queryAllByRole('button')).toHaveLength(0);
      await expect(within(dialog).getByRole('status')).toHaveTextContent(
        'No results',
      );
      await userEvent.keyboard('{Enter}');
      await expect(dialog).toBeVisible();
      await expect(search).toHaveFocus();
    }
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const KeyboardSelection: Story = {
  args: { onValueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Phone country',
    });

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
      { name: 'Phone country choices' },
    );
    const search = within(dialog).getByRole('searchbox');

    await waitFor(() => expect(search).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(
      within(dialog).getByRole('button', { name: 'Canada (+1)' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenCalledWith('CA');
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());

    const reopened = await openPhoneCountryPicker({ canvasElement });

    await userEvent.type(reopened.search, 'germany');
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('DE');
    await waitFor(() => expect(reopened.dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const DismissalResetsSearch: Story = {
  args: { onValueChange: fn() },
  render: (args) => (
    <Text style={{ display: 'grid', gap: 16 }}>
      <PhoneCountryPickerExample key={args.initialValue} {...args} />
      <Button>Next field</Button>
    </Text>
  ),
  play: async ({ canvasElement, args }) => {
    const { dialog, search, trigger } = await openPhoneCountryPicker({
      canvasElement,
    });

    await userEvent.type(search, 'Germany');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    const reopened = await openPhoneCountryPicker({ canvasElement });

    await expect(reopened.search).toHaveValue('');
    await expect(within(reopened.dialog).getAllByRole('button')).toHaveLength(
      5,
    );
    const nextField = within(canvasElement).getByRole('button', {
      name: 'Next field',
    });

    await userEvent.click(nextField);
    await waitFor(() => expect(reopened.dialog).not.toBeInTheDocument());
    await expect(nextField).toHaveFocus();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const IndependentInstances: Story = {
  render: (args) => (
    <Text style={{ display: 'flex', gap: 24 }}>
      <PhoneCountryPickerExample
        key={args.initialValue}
        {...args}
        label="Primary country"
      />
      <PhoneCountryPickerExample label="Secondary country" initialValue="GB" />
    </Text>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const primary = await openPhoneCountryPicker({
      canvasElement,
      label: 'Primary country',
    });

    await userEvent.type(primary.search, 'Canada');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(primary.dialog).not.toBeInTheDocument());
    await expect(
      canvas.getByRole('status', { name: 'Primary country selection' }),
    ).toHaveTextContent('Canada (+1)');
    await expect(
      canvas.getByRole('status', { name: 'Secondary country selection' }),
    ).toHaveTextContent('United Kingdom (+44)');

    const secondary = await openPhoneCountryPicker({
      canvasElement,
      label: 'Secondary country',
    });

    await expect(secondary.search).toHaveValue('');
    await expect(
      within(secondary.dialog).getAllByRole('button')[0],
    ).toHaveAccessibleName('United Kingdom (+44)');
    await userEvent.click(
      within(secondary.dialog).getByRole('button', { name: 'Germany (+49)' }),
    );
    await waitFor(() => expect(secondary.dialog).not.toBeInTheDocument());
    await expect(
      canvas.getByRole('status', { name: 'Primary country selection' }),
    ).toHaveTextContent('Canada (+1)');
    await expect(
      canvas.getByRole('status', { name: 'Secondary country selection' }),
    ).toHaveTextContent('Germany (+49)');
  },
};

export const CustomLabelsAndEmptyChoices: Story = {
  args: {
    countries: [],
    searchLabel: 'Find a country',
    emptyLabel: 'No countries available',
    onValueChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const { dialog, search } = await openPhoneCountryPicker({ canvasElement });

    await expect(search).toHaveAccessibleName('Find a country');
    await expect(within(dialog).getByRole('status')).toHaveTextContent(
      'No countries available',
    );
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(search).toHaveFocus();
    await expect(dialog).toBeVisible();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};
