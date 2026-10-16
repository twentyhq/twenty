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
    <Text
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: 16,
        padding: 16,
      }}
    >
      {(['ltr', 'rtl'] as const).map((direction) => (
        <DirectionalLayoutExample
          key={direction}
          direction={direction}
          style={{
            boxSizing: 'border-box',
            width: '100%',
            minWidth: 0,
            border: '1px solid var(--t-border-color-light)',
            borderRadius: 8,
          }}
        />
      ))}
    </Text>
  ),
};

export const VisualRegression: Story = {
  tags: ['!autodocs'],
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
