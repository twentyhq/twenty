import { A11Y_DEFER_COLOR_CONTRAST } from '@ui/testing';
import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ThemeProvider } from '@ui/theme';

import { DirectionalLayoutExample } from './DirectionalLayoutExample';

const meta: Meta<typeof DirectionalLayoutExample> = {
  title: 'UI/Layout/DirectionProvider',
  component: DirectionalLayoutExample,
  parameters: { layout: 'fullscreen', a11y: A11Y_DEFER_COLOR_CONTRAST },
};

export default meta;
type Story = StoryObj<typeof DirectionalLayoutExample>;

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
