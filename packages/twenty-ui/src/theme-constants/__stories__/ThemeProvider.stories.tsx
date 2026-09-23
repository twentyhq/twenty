import { isNonEmptyString } from '@sniptt/guards';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { ThemeProvider } from '../ThemeProvider';
import { themeCssVariables } from '../themeCssVariables';
import { useTheme } from '../useTheme';

const ThemeTokens = () => {
  const theme = useTheme();

  return (
    <>
      <output aria-label="Medium icon size">
        {JSON.stringify(theme.icon.size.md)}
      </output>
      <output aria-label="Small icon size">
        {JSON.stringify(theme.icon.size.sm)}
      </output>
      <output aria-label="Primary font color">
        {JSON.stringify(theme.font.color.primary)}
      </output>
      <output aria-label="Small border radius">
        {JSON.stringify(theme.border.radius.sm)}
      </output>
    </>
  );
};

type ScaleExampleProps = {
  initialScale?: number | null;
};

const ScaleExample = ({ initialScale = 1.25 }: ScaleExampleProps) => {
  const [scale, setScale] = useState<number | undefined>(
    initialScale ?? undefined,
  );
  const [mounted, setMounted] = useState(true);

  return (
    <>
      {mounted && (
        <ThemeProvider colorScheme="light" scale={scale}>
          <span>Theme active</span>
        </ThemeProvider>
      )}
      <button type="button" onClick={() => setScale(0.9)}>
        Change scale
      </button>
      <button type="button" onClick={() => setScale(undefined)}>
        Reset scale
      </button>
      <button type="button" onClick={() => setMounted(false)}>
        Unmount theme
      </button>
    </>
  );
};

const readInlineScale = () =>
  document.documentElement.style.getPropertyValue('--t-scale-user');

const meta: Meta<typeof ThemeProvider> = {
  title: 'UI/Theme/ThemeProvider',
  component: ThemeProvider,
  args: { colorScheme: 'light', children: <ThemeTokens /> },
  beforeEach: () => {
    const previousScale = readInlineScale();
    document.documentElement.style.removeProperty('--t-scale-user');

    return () => {
      if (isNonEmptyString(previousScale)) {
        document.documentElement.style.setProperty(
          '--t-scale-user',
          previousScale,
        );
      } else {
        document.documentElement.style.removeProperty('--t-scale-user');
      }
    };
  },
};

export default meta;
type Story = StoryObj<typeof ThemeProvider>;

export const ScaleChanges: Story = {
  render: () => <ScaleExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(readInlineScale()).toBe('1.25');
    await userEvent.click(canvas.getByRole('button', { name: 'Change scale' }));
    await expect(readInlineScale()).toBe('0.9');
    await userEvent.click(canvas.getByRole('button', { name: 'Reset scale' }));
    await expect(readInlineScale()).toBe('');
  },
};

export const ScaleCleanup: Story = {
  render: () => <ScaleExample />,
  play: async ({ canvasElement }) => {
    await expect(readInlineScale()).toBe('1.25');
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Unmount theme' }),
    );
    await expect(readInlineScale()).toBe('');
  },
};

export const ScopedScale: Story = {
  args: { overrides: {}, scale: 1.25 },
  play: async () => {
    await expect(readInlineScale()).toBe('');
  },
};

export const ExistingScale: Story = {
  beforeEach: () => {
    document.documentElement.style.setProperty('--t-scale-user', '1.25');
  },
  render: () => <ScaleExample initialScale={null} />,
  play: async ({ canvasElement }) => {
    await expect(readInlineScale()).toBe('1.25');
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Unmount theme' }),
    );
    await expect(readInlineScale()).toBe('1.25');
  },
};

export const UnresolvedTokens: Story = {
  args: {
    applyToRoot: false,
    overrides: {
      '--t-icon-size-md': 'initial',
      '--t-font-color-primary': 'initial',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText('Medium icon size')).toHaveTextContent(
      JSON.stringify(themeCssVariables.icon.size.md),
    );
    await expect(canvas.getByLabelText('Primary font color')).toHaveTextContent(
      JSON.stringify(themeCssVariables.font.color.primary),
    );
  },
};

export const NumericTokens: Story = {
  args: {
    applyToRoot: false,
    overrides: { '--t-icon-size-md': '16', '--t-icon-size-sm': 'initial' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText('Medium icon size').textContent).toBe(
      '16',
    );
    await expect(canvas.getByLabelText('Small icon size')).toHaveTextContent(
      JSON.stringify(themeCssVariables.icon.size.sm),
    );
  },
};

export const StringTokens: Story = {
  args: {
    applyToRoot: false,
    overrides: {
      '--t-font-color-primary': '#181d27',
      '--t-border-radius-sm': '4px',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText('Primary font color').textContent).toBe(
      '"#181d27"',
    );
    await expect(canvas.getByLabelText('Small border radius').textContent).toBe(
      '"4px"',
    );
  },
};
