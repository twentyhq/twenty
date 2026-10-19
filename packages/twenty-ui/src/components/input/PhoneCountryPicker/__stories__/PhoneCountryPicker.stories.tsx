import { type Meta, type StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { DirectionProvider } from '@ui/primitives/layout/DirectionProvider/DirectionProvider';
import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator } from '@ui/testing';

import { PhoneCountryPickerExample } from './PhoneCountryPickerExample';
import { PHONE_COUNTRY_PICKER_STORY_A11Y_PARAMETERS } from './phoneCountryPickerStoryA11yParameters';
import { testDisabledPhoneCountryPicker } from './testDisabledPhoneCountryPicker';
import { testPhoneCountryCallingCodeDirection } from './testPhoneCountryCallingCodeDirection';
import { testPhoneCountryNullSelection } from './testPhoneCountryNullSelection';
import { testPhoneCountrySelection } from './testPhoneCountrySelection';

const meta: Meta<typeof PhoneCountryPickerExample> = {
  id: 'ui-input-phonecountrypicker',
  title: 'UI/Components/Input/PhoneCountryPicker',
  component: PhoneCountryPickerExample,
  render: (args) => (
    <PhoneCountryPickerExample
      key={args.initialValue}
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...args}
    />
  ),
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 320 },
    a11y: PHONE_COUNTRY_PICKER_STORY_A11Y_PARAMETERS,
  },
};

export default meta;
type Story = StoryObj<typeof PhoneCountryPickerExample>;

export const Display: Story = {
  args: {
    countries: [
      { value: 'FR', label: 'France', callingCode: '33', flag: '🇫🇷' },
      { value: 'GB', label: 'United Kingdom', callingCode: '44', flag: '🇬🇧' },
      { value: 'US', label: 'United States', callingCode: '1', flag: '🇺🇸' },
    ],
    searchLabel: 'Search countries',
    emptyLabel: 'No countries found',
  },
};

export const Default: Story = {
  args: { onValueChange: fn() },
  play: testPhoneCountrySelection,
};

export const Compound: Story = {
  args: { composition: 'compound', controlled: true, onValueChange: fn() },
  play: testPhoneCountrySelection,
};

export const Dark: Story = {
  args: { onValueChange: fn() },
  globals: { colorScheme: 'dark' },
  play: testPhoneCountrySelection,
};

export const International: Story = {
  args: { initialValue: null, onValueChange: fn() },
  play: testPhoneCountryNullSelection,
};

export const Disabled: Story = {
  args: { disabled: true, onValueChange: fn() },
  play: testDisabledPhoneCountryPicker,
};

export const RightToLeft: Story = {
  render: (args) => (
    <DirectionProvider direction="rtl">
      <Text dir="rtl">
        <PhoneCountryPickerExample
          key={args.initialValue}
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...args}
        />
      </Text>
    </DirectionProvider>
  ),
  play: testPhoneCountryCallingCodeDirection,
};
