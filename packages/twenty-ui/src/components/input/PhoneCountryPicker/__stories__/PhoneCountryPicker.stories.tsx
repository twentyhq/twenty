import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { TextDirectionProvider } from '@ui/primitives/layout/TextDirectionProvider/TextDirectionProvider';
import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator } from '@ui/testing';

import { PhoneCountryPickerExample } from './PhoneCountryPickerExample';
import { openPhoneCountryPicker } from './openPhoneCountryPicker';
import { PHONE_COUNTRY_PICKER_STORY_A11Y_PARAMETERS } from './phoneCountryPickerStoryA11yParameters';

const meta: Meta<typeof PhoneCountryPickerExample> = {
  title: 'UI/Input/PhoneCountryPicker',
  component: PhoneCountryPickerExample,
  render: (args) => (
    <PhoneCountryPickerExample key={args.initialValue} {...args} />
  ),
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 320, height: 360 },
    a11y: PHONE_COUNTRY_PICKER_STORY_A11Y_PARAMETERS,
  },
};

export default meta;
type Story = StoryObj<typeof PhoneCountryPickerExample>;

export const Documentation: Story = {};

export const Default: Story = {
  args: { onValueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const { dialog, trigger } = await openPhoneCountryPicker({ canvasElement });
    const choices = within(dialog).getAllByRole('button');

    await expect(choices.map((choice) => choice.textContent)).toEqual([
      expect.stringContaining('France (+33)'),
      expect.stringContaining('Canada (+1)'),
      expect.stringContaining('Germany (+49)'),
      expect.stringContaining('United Kingdom (+44)'),
      expect.stringContaining('United States (+1)'),
    ]);
    await expect(
      within(dialog).getByRole('button', { name: 'France (+33)' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Canada (+1)' }),
    );
    await expect(args.onValueChange).toHaveBeenCalledOnce();
    await expect(args.onValueChange).toHaveBeenCalledWith('CA');
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(
      within(canvasElement).getByRole('status', {
        name: 'Phone country selection',
      }),
    ).toHaveTextContent('Canada (+1)');

    const reopened = await openPhoneCountryPicker({ canvasElement });

    await expect(
      within(reopened.dialog).getAllByRole('button')[0],
    ).toHaveAccessibleName('Canada (+1)');
    await expect(
      within(reopened.dialog).getByRole('button', { name: 'Canada (+1)' }),
    ).toHaveAttribute('aria-pressed', 'true');
  },
};

export const Dark: Story = {
  ...Default,
  args: { onValueChange: fn() },
  globals: { colorScheme: 'dark' },
};

export const International: Story = {
  args: { initialValue: '' },
  play: async ({ canvasElement }) => {
    const { dialog } = await openPhoneCountryPicker({ canvasElement });

    for (const choice of within(dialog).getAllByRole('button')) {
      await expect(choice).toHaveAttribute('aria-pressed', 'false');
    }
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'United States (+1)' }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(
      within(canvasElement).getByRole('status', {
        name: 'Phone country selection',
      }),
    ).toHaveTextContent('United States (+1)');
  },
};

export const Disabled: Story = {
  args: { disabled: true, onValueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Phone country',
    });

    await expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    await expect(
      within(canvasElement.ownerDocument.body).queryByRole('dialog'),
    ).not.toBeInTheDocument();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const RightToLeft: Story = {
  render: (args) => (
    <TextDirectionProvider direction="rtl">
      <Text dir="rtl">
        <PhoneCountryPickerExample key={args.initialValue} {...args} />
      </Text>
    </TextDirectionProvider>
  ),
  play: async ({ canvasElement }) => {
    const { dialog, trigger } = await openPhoneCountryPicker({ canvasElement });

    await expect(getComputedStyle(trigger).direction).toBe('rtl');
    await expect(getComputedStyle(trigger).borderLeftWidth).toBe('1px');
    await expect(getComputedStyle(trigger).borderRightWidth).toBe('0px');
    await expect(getComputedStyle(dialog).direction).toBe('rtl');
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'United Kingdom (+44)' }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(
      within(canvasElement).getByRole('status', {
        name: 'Phone country selection',
      }),
    ).toHaveTextContent('United Kingdom (+44)');
  },
};
