import { type Meta, type StoryObj } from '@storybook/react-vite';

import { DirectionProvider } from '@ui/primitives/layout/DirectionProvider/DirectionProvider';
import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator } from '@ui/testing';

import { PhoneCountryPickerExample } from './PhoneCountryPickerExample';
import { PHONE_COUNTRY_PICKER_STORY_A11Y_PARAMETERS } from './phoneCountryPickerStoryA11yParameters';

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
    container: { width: 320, height: 360 },
    a11y: PHONE_COUNTRY_PICKER_STORY_A11Y_PARAMETERS,
  },
};

export default meta;
type Story = StoryObj<typeof PhoneCountryPickerExample>;

export const Documentation: Story = {};

export const Default: Story = {};

export const Compound: Story = { args: { composition: 'compound' } };

export const Dark: Story = { globals: { colorScheme: 'dark' } };

export const International: Story = { args: { initialValue: null } };

export const Disabled: Story = { args: { disabled: true } };

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
};
