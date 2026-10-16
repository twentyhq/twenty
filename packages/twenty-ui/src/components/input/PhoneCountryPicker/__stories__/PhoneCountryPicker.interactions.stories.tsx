import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator } from '@ui/testing';

import { PhoneCountryPickerExample } from './PhoneCountryPickerExample';
import { openPhoneCountryPicker } from './openPhoneCountryPicker';
import { PHONE_COUNTRY_OPTIONS } from './phoneCountryOptions';
import { PHONE_COUNTRY_PICKER_STORY_A11Y_PARAMETERS } from './phoneCountryPickerStoryA11yParameters';
import { testDisabledPhoneCountryPicker } from './testDisabledPhoneCountryPicker';
import { testPhoneCountryNullSelection } from './testPhoneCountryNullSelection';
import { testPhoneCountrySelection } from './testPhoneCountrySelection';

const meta: Meta<typeof PhoneCountryPickerExample> = {
  id: 'ui-input-phonecountrypicker-interactions',
  title: 'UI/Components/Input/PhoneCountryPicker/Interactions',
  component: PhoneCountryPickerExample,
  render: (args) => (
    <PhoneCountryPickerExample
      key={args.initialValue}
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...args}
    />
  ),
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 360 },
    a11y: PHONE_COUNTRY_PICKER_STORY_A11Y_PARAMETERS,
  },
};

export default meta;
type Story = StoryObj<typeof PhoneCountryPickerExample>;

export const SearchableCountryFields: Story = {
  args: {
    countries: [
      ...PHONE_COUNTRY_OPTIONS,
      { value: 'RE', label: 'Réunion', callingCode: '262', flag: '🇷🇪' },
    ],
    onValueChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const { dialog, search } = await openPhoneCountryPicker({ canvasElement });

    const initialOptions = within(dialog).getAllByRole('option');

    await userEvent.type(search, '   ');
    await expect(within(dialog).getAllByRole('option')).toHaveLength(
      initialOptions.length,
    );
    await userEvent.clear(search);
    await expect(within(dialog).getAllByRole('option')).toHaveLength(
      initialOptions.length,
    );

    for (const query of ['reunion', ' RÉUNION ']) {
      await userEvent.clear(search);
      await userEvent.type(search, query);
      await expect(within(dialog).getAllByRole('option')).toHaveLength(1);
      await expect(
        within(dialog).getByRole('option', { name: 'Réunion (+262)' }),
      ).toBeVisible();
    }
    await userEvent.clear(search);
    await userEvent.type(search, 'a');
    await expect(
      within(dialog)
        .getAllByRole('option')
        .map((choice) => choice.textContent),
    ).toEqual([
      expect.stringContaining('France (+33)'),
      expect.stringContaining('Canada (+1)'),
      expect.stringContaining('Germany (+49)'),
      expect.stringContaining('United States (+1)'),
    ]);
    await userEvent.clear(search);
    await userEvent.type(search, 'uNiTeD');
    await expect(within(dialog).getAllByRole('option')).toHaveLength(2);
    await expect(
      within(dialog).queryByRole('option', { name: 'France (+33)' }),
    ).not.toBeInTheDocument();
    await expect(within(dialog).getAllByRole('option')[0]).toHaveAccessibleName(
      'United Kingdom (+44)',
    );

    for (const { query, option } of [
      { query: ' France ', option: 'France (+33)' },
      { query: '+33', option: 'France (+33)' },
      { query: '33', option: 'France (+33)' },
      { query: ' gb ', option: 'United Kingdom (+44)' },
    ]) {
      await userEvent.clear(search);
      await userEvent.type(search, query);
      await expect(within(dialog).getAllByRole('option')).toHaveLength(1);
      await expect(
        within(dialog).getByRole('option', { name: option }),
      ).toBeVisible();
    }

    for (const query of ['unknown', '+999', '+']) {
      await userEvent.clear(search);
      await userEvent.type(search, query);
      await expect(within(dialog).queryAllByRole('option')).toHaveLength(0);
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
      within(dialog).getByRole('option', { name: 'Canada (+1)' }),
    ).toHaveFocus();
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{End}');
    await expect(
      within(dialog).getByRole('option', { name: 'United States (+1)' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(
      within(dialog).getByRole('option', { name: 'France (+33)' }),
    ).toHaveFocus();
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{ArrowDown} ');
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'CA',
      expect.anything(),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());

    const reopened = await openPhoneCountryPicker({ canvasElement });

    await userEvent.type(reopened.search, 'germany');
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      'DE',
      expect.anything(),
    );
    await waitFor(() => expect(reopened.dialog).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const LetterNavigation: Story = {
  args: { onValueChange: fn() },
  play: async ({ canvasElement, args }) => {
    const { dialog } = await openPhoneCountryPicker({ canvasElement });

    await userEvent.keyboard('{ArrowDown}');
    await expect(
      within(dialog).getByRole('option', { name: 'France (+33)' }),
    ).toHaveFocus();
    await userEvent.keyboard('g');
    await expect(
      within(dialog).getByRole('option', { name: 'Germany (+49)' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'DE',
      expect.anything(),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};

export const DismissalResetsSearch: Story = {
  args: { onValueChange: fn() },
  render: (args) => (
    <Text style={{ display: 'grid', gap: 16 }}>
      <PhoneCountryPickerExample
        key={args.initialValue}
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...args}
      />
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
    await expect(within(reopened.dialog).getAllByRole('option')).toHaveLength(
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
        // oxlint-disable-next-line react/jsx-props-no-spreading
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
      within(secondary.dialog).getAllByRole('option')[0],
    ).toHaveAccessibleName('United Kingdom (+44)');
    await userEvent.click(
      within(secondary.dialog).getByRole('option', { name: 'Germany (+49)' }),
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
    listLabel: 'Available countries',
    emptyLabel: 'No countries available',
    onValueChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const { dialog, search } = await openPhoneCountryPicker({ canvasElement });

    await expect(search).toHaveAccessibleName('Find a country');
    await expect(
      within(dialog).getByRole('listbox', { name: 'Available countries' }),
    ).toBeVisible();
    await expect(within(dialog).getByRole('status')).toHaveTextContent(
      'No countries available',
    );
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(search).toHaveFocus();
    await expect(dialog).toBeVisible();
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const ShorthandSelection: Story = {
  args: { onValueChange: fn() },
  play: testPhoneCountrySelection,
};

export const CompoundSelection: Story = {
  ...ShorthandSelection,
  args: { composition: 'compound', controlled: true, onValueChange: fn() },
};

export const NullInitialValue: Story = {
  args: { initialValue: null, onValueChange: fn() },
  play: testPhoneCountryNullSelection,
};

export const DisabledInteractions: Story = {
  args: { onValueChange: fn() },
  render: (args) => (
    <Text style={{ display: 'flex', gap: 24 }}>
      <PhoneCountryPickerExample
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...args}
        disabled
      />
      <PhoneCountryPickerExample
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...args}
        label="Available country"
        countries={PHONE_COUNTRY_OPTIONS.map((country) => ({
          ...country,
          disabled: country.value === 'CA',
        }))}
      />
    </Text>
  ),
  play: async ({ canvasElement, args }) => {
    await testDisabledPhoneCountryPicker({ canvasElement, args });
    const { dialog } = await openPhoneCountryPicker({
      canvasElement,
      label: 'Available country',
    });
    const disabledOption = within(dialog).getByRole('option', {
      name: 'Canada (+1)',
    });

    await expect(disabledOption).toBeDisabled();
    await userEvent.click(disabledOption);
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(dialog).toBeVisible();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(
      within(dialog).getByRole('option', { name: 'Germany (+49)' }),
    ).toHaveFocus();
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      'DE',
      expect.anything(),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
