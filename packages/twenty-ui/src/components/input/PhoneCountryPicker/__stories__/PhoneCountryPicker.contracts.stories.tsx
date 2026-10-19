import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { createStoryState } from '@ui/components/navigation/Dropdown/__stories__/createStoryState';
import { Button } from '@ui/primitives/input/Button/Button';
import { DirectionProvider } from '@ui/primitives/layout/DirectionProvider/DirectionProvider';
import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator } from '@ui/testing';

import { PhoneCountryPicker } from '../PhoneCountryPicker';
import { type PhoneCountryPickerRootProps } from '../types/PhoneCountryPickerRootProps';
import { openPhoneCountryPicker } from './openPhoneCountryPicker';
import { PHONE_COUNTRY_OPTIONS } from './phoneCountryOptions';
import { PHONE_COUNTRY_PICKER_STORY_A11Y_PARAMETERS } from './phoneCountryPickerStoryA11yParameters';
import { testPhoneCountryCallingCodeDirection } from './testPhoneCountryCallingCodeDirection';

const onValueChange = fn();
const onTriggerRef = fn();
const onOptionsRef = fn();
const externalCountry = createStoryState<string | null>('FR');

const ContractPicker = ({ compound = false }: { compound?: boolean }) => {
  const value = externalCountry.useValue();
  const selectionProps: Omit<PhoneCountryPickerRootProps, 'children'> = {
    countries: PHONE_COUNTRY_OPTIONS,
    value,
    onValueChange,
    closeOnSelect: false,
  };

  if (!compound) {
    return (
      <PhoneCountryPicker
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...selectionProps}
        aria-label="Phone country"
        contentProps={{ 'aria-label': 'Phone country choices' }}
      />
    );
  }

  return (
    <PhoneCountryPicker.Root
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...selectionProps}
    >
      <Dropdown.Root type="picker">
        <PhoneCountryPicker.Trigger aria-label="Phone country" />
        <Dropdown.Content aria-label="Phone country choices">
          <PhoneCountryPicker.Options />
        </Dropdown.Content>
      </Dropdown.Root>
    </PhoneCountryPicker.Root>
  );
};

const meta: Meta = {
  id: 'ui-input-phonecountrypicker-contracts',
  title: 'UI/Components/Input/PhoneCountryPicker/Interactions/Contracts',
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 360, height: 360 },
    a11y: PHONE_COUNTRY_PICKER_STORY_A11Y_PARAMETERS,
  },
  beforeEach: () => {
    onValueChange.mockClear();
    onTriggerRef.mockClear();
    onOptionsRef.mockClear();
    externalCountry.set('FR');
  },
};

export default meta;
type Story = StoryObj;

export const ControlledExternalChanges: Story = {
  render: () => <ContractPicker />,
  play: async ({ canvasElement }) => {
    const { dialog, trigger } = await openPhoneCountryPicker({ canvasElement });
    const france = within(dialog).getByRole('option', { name: 'France (+33)' });
    const canada = within(dialog).getByRole('option', { name: 'Canada (+1)' });

    await expect(france).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(canada);
    await expect(onValueChange).toHaveBeenCalledOnce();
    await expect(onValueChange).toHaveBeenLastCalledWith(
      'CA',
      expect.objectContaining({
        reason: 'item-press',
        trigger: canada,
        isCanceled: false,
        event: expect.objectContaining({ type: 'click' }),
      }),
    );
    await expect(canada).toHaveAttribute('aria-selected', 'false');
    await expect(trigger).toHaveAccessibleDescription('France');

    externalCountry.set('CA');

    await waitFor(() =>
      expect(canada).toHaveAttribute('aria-selected', 'true'),
    );
    await expect(trigger).toHaveAccessibleDescription('Canada');

    externalCountry.set(null);

    await waitFor(() =>
      expect(canada).toHaveAttribute('aria-selected', 'false'),
    );
    await expect(trigger).not.toHaveAccessibleDescription();
    await expect(
      within(dialog)
        .getAllByRole('option')
        .every((option) => option.getAttribute('aria-selected') === 'false'),
    ).toBe(true);

    externalCountry.set('unknown');

    await expect(trigger).not.toHaveAccessibleDescription();
    await expect(onValueChange).toHaveBeenCalledOnce();

    externalCountry.set('DE');

    await waitFor(() =>
      expect(
        within(dialog).getByRole('option', { name: 'Germany (+49)' }),
      ).toHaveAttribute('aria-selected', 'true'),
    );
    await expect(trigger).toHaveAccessibleDescription('Germany');
    await expect(onValueChange).toHaveBeenCalledOnce();
    await userEvent.keyboard('{Escape}');
  },
};

export const CompoundControlledExternalChanges: Story = {
  ...ControlledExternalChanges,
  render: () => <ContractPicker compound />,
};

export const CancelledSelection: Story = {
  render: () => (
    <PhoneCountryPicker
      aria-label="Phone country"
      countries={PHONE_COUNTRY_OPTIONS}
      defaultValue="FR"
      onValueChange={(value, eventDetails) => {
        onValueChange(value, eventDetails);
        eventDetails.cancel();
      }}
      contentProps={{ 'aria-label': 'Phone country choices' }}
    />
  ),
  play: async ({ canvasElement }) => {
    const { dialog, trigger } = await openPhoneCountryPicker({ canvasElement });
    const canada = within(dialog).getByRole('option', { name: 'Canada (+1)' });

    await userEvent.click(canada);
    await expect(onValueChange).toHaveBeenCalledOnce();
    await expect(onValueChange).toHaveBeenLastCalledWith(
      'CA',
      expect.objectContaining({ isCanceled: true, trigger: canada }),
    );
    await expect(canada).toHaveAttribute('aria-selected', 'false');
    await expect(trigger).toHaveAccessibleDescription('France');
    await expect(dialog).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};

export const NativeTargetsAndRender: Story = {
  render: () => (
    <PhoneCountryPicker
      aria-label="Phone country"
      countries={PHONE_COUNTRY_OPTIONS}
      defaultValue="FR"
      ref={onTriggerRef}
      name="phone-country"
      title="Choose calling region"
      children="Calling region"
      render={<Button data-testid="phone-country-trigger" />}
      contentProps={{ 'aria-label': 'Phone country choices' }}
      optionsProps={{
        ref: onOptionsRef,
        id: 'phone-country-options',
        title: 'Available calling regions',
        render: <section data-testid="phone-country-options" />,
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByTestId('phone-country-trigger');

    await expect(trigger).toHaveAttribute('name', 'phone-country');
    await expect(trigger).toHaveAttribute('title', 'Choose calling region');
    await expect(trigger).toHaveTextContent('Calling region');
    await expect(onTriggerRef).toHaveBeenCalledWith(trigger);
    const { dialog } = await openPhoneCountryPicker({ canvasElement });
    const options = within(dialog).getByTestId('phone-country-options');

    await expect(options.tagName).toBe('SECTION');
    await expect(options).toHaveAttribute('id', 'phone-country-options');
    await expect(options).toHaveAttribute('title', 'Available calling regions');
    await expect(onOptionsRef).toHaveBeenCalledWith(options);
    await expect(within(options).getAllByRole('option')).toHaveLength(5);
    await userEvent.click(
      within(options).getByRole('option', { name: 'Canada (+1)' }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(trigger).toHaveAccessibleDescription('Canada');
  },
};

export const RightToLeftCallingCodes: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <Text dir="rtl">
        <PhoneCountryPicker
          aria-label="Phone country"
          countries={PHONE_COUNTRY_OPTIONS}
          defaultValue="FR"
          contentProps={{ 'aria-label': 'Phone country choices' }}
        />
      </Text>
    </DirectionProvider>
  ),
  play: testPhoneCountryCallingCodeDirection,
};

const OVERFLOWING_ARABIC_COUNTRY_LABEL =
  'المملكة المتحدة لبريطانيا العظمى وأيرلندا الشمالية';

export const RightToLeftOverflowTooltip: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <Text dir="rtl">
        <PhoneCountryPicker
          aria-label="Phone country"
          countries={[
            {
              value: 'GB',
              label: OVERFLOWING_ARABIC_COUNTRY_LABEL,
              callingCode: '44',
              flag: '🇬🇧',
            },
          ]}
          defaultValue="GB"
          contentProps={{ 'aria-label': 'Phone country choices', width: 180 }}
        />
      </Text>
    </DirectionProvider>
  ),
  play: async ({ canvasElement }) => {
    const { dialog } = await openPhoneCountryPicker({ canvasElement });
    const option = within(dialog).getByRole('option', {
      name: `${OVERFLOWING_ARABIC_COUNTRY_LABEL} (+44)`,
    });
    const countryLabel = within(option).getByText(
      OVERFLOWING_ARABIC_COUNTRY_LABEL,
      { exact: false },
    );

    await expect(countryLabel.scrollWidth).toBeGreaterThan(
      countryLabel.clientWidth,
    );
    await userEvent.hover(countryLabel);
    const tooltip = await within(canvasElement.ownerDocument.body).findByRole(
      'tooltip',
    );

    await waitFor(() => expect(tooltip).toBeVisible());
    await expect(getComputedStyle(tooltip).direction).toBe('rtl');
    await expect(tooltip).toHaveTextContent(
      `${OVERFLOWING_ARABIC_COUNTRY_LABEL} (\u2066+44\u2069)`,
    );
    await userEvent.unhover(countryLabel);
    await userEvent.keyboard('{Escape}');
  },
};

export const CompoundCancelledSelection: Story = {
  ...CancelledSelection,
  render: () => (
    <PhoneCountryPicker.Root
      countries={PHONE_COUNTRY_OPTIONS}
      defaultValue="FR"
      onValueChange={(value, eventDetails) => {
        onValueChange(value, eventDetails);
        eventDetails.cancel();
      }}
    >
      <Dropdown.Root type="picker">
        <PhoneCountryPicker.Trigger aria-label="Phone country" />
        <Dropdown.Content aria-label="Phone country choices">
          <PhoneCountryPicker.Options />
        </Dropdown.Content>
      </Dropdown.Root>
    </PhoneCountryPicker.Root>
  ),
};

const UncontrolledPicker = () => (
  <PhoneCountryPicker
    countries={PHONE_COUNTRY_OPTIONS}
    defaultValue={externalCountry.useValue()}
    onValueChange={onValueChange}
    closeOnSelect={false}
    aria-label="Phone country"
    contentProps={{ 'aria-label': 'Phone country choices' }}
  />
);

export const DefaultValueOnlyInitializes: Story = {
  render: () => <UncontrolledPicker />,
  play: async ({ canvasElement }) => {
    const { dialog, trigger } = await openPhoneCountryPicker({ canvasElement });

    externalCountry.set('DE');

    await expect(trigger).toHaveAccessibleDescription('France');
    await expect(
      within(dialog).getByRole('option', { name: 'France (+33)' }),
    ).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(
      within(dialog).getByRole('option', { name: 'Canada (+1)' }),
    );
    await expect(trigger).toHaveAccessibleDescription('Canada');

    externalCountry.set(null);

    await expect(trigger).toHaveAccessibleDescription('Canada');
    await expect(onValueChange).toHaveBeenCalledOnce();
    await expect(dialog).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};
