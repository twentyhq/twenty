import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';
import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ThemeProvider } from '@ui/theme';
import { SegmentedControl } from '@ui/components/input';
import { DirectionProvider } from '@ui/primitives/layout';
import { Text } from '@ui/primitives/typography';

import { DirectionalLayoutExample } from './DirectionalLayoutExample';

const meta: Meta<typeof DirectionalLayoutExample> = {
  title: 'UI/Layout/DirectionProvider',
  component: DirectionalLayoutExample,
  parameters: { layout: 'fullscreen', a11y: A11Y_DEFER_COLOR_CONTRAST },
};

export default meta;
type Story = StoryObj<typeof DirectionalLayoutExample>;

export const Display: Story = {
  args: { direction: 'rtl' },
  decorators: [ComponentDecorator],
  parameters: { layout: 'centered' },
  render: ({ direction }) => (
    <DirectionProvider direction={direction}>
      <Text dir={direction}>
        <SegmentedControl
          aria-label="Billing period"
          defaultValue="annual"
          options={[
            { label: 'Annual', value: 'annual' },
            { label: 'Monthly', value: 'monthly' },
          ]}
        />
      </Text>
    </DirectionProvider>
  ),
};

export const ReadingDirections: Story = {
  render: () => (
    <div
      style={{ display: 'grid', gridTemplateColumns: 'repeat(2, max-content)' }}
    >
      {(['light', 'dark'] as const).flatMap((colorScheme) =>
        (['ltr', 'rtl'] as const).map((direction) => (
          <ThemeProvider
            key={`${colorScheme}-${direction}`}
            colorScheme={colorScheme}
            applyToRoot={false}
          >
            <DirectionalLayoutExample direction={direction} />
          </ThemeProvider>
        )),
      )}
    </div>
  ),
};
