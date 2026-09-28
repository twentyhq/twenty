import { A11Y_DEFER_COLOR_CONTRAST } from '@ui/testing';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { ThemeProvider } from '@ui/theme';

import { DirectionalLayoutExample } from './DirectionalLayoutExample';

const meta: Meta<typeof DirectionalLayoutExample> = {
  title: 'UI/Layout/TextDirectionProvider',
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const direction of ['ltr', 'rtl']) {
      const [lightLayout, darkLayout] = canvas.getAllByTestId(
        `layout-${direction}`,
      );

      expect(getComputedStyle(lightLayout!).direction).toBe(direction);
      expect(getComputedStyle(darkLayout!).direction).toBe(direction);
      expect(getComputedStyle(lightLayout!).backgroundColor).not.toBe(
        getComputedStyle(darkLayout!).backgroundColor,
      );
    }
  },
};
