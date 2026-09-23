import { isNonEmptyString } from '@sniptt/guards';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input';
import { Popover } from '@ui/primitives/surfaces';
import {
  THEME_DARK,
  THEME_LIGHT,
  ThemeProvider,
  themeCssVariables,
  type ThemeType,
  useTheme,
  useThemeColorScheme,
  useThemeContainer,
} from '@ui/theme';

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
      <Button onClick={() => setScale(0.9)}>Change scale</Button>
      <Button onClick={() => setScale(undefined)}>Reset scale</Button>
      <Button onClick={() => setMounted(false)}>Unmount theme</Button>
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

const ThemeReadout = () => {
  const theme = useTheme();
  const colorScheme = useThemeColorScheme();
  const container = useThemeContainer();

  return (
    <>
      <output aria-label="Color scheme">{colorScheme}</output>
      <output aria-label="Theme color">{theme.font.color.primary}</output>
      <output aria-label="Theme scope">{container?.className ?? 'root'}</output>
      <output aria-label="Icon size">{theme.icon.size.md}</output>
    </>
  );
};

const ChangingTheme = ({
  staticValues = false,
}: {
  staticValues?: boolean;
}) => {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const staticTheme = colorScheme === 'dark' ? THEME_DARK : THEME_LIGHT;

  return (
    <ThemeProvider
      colorScheme={colorScheme}
      applyToRoot={false}
      theme={staticValues ? (staticTheme as unknown as ThemeType) : undefined}
    >
      <div
        style={{
          background: themeCssVariables.background.primary,
          color: themeCssVariables.font.color.primary,
          padding: 16,
        }}
      >
        <ThemeReadout />
        <Button onClick={() => setColorScheme('dark')}>Use dark theme</Button>
      </div>
    </ThemeProvider>
  );
};

export const ColorSchemeChanges: Story = {
  render: () => <ChangingTheme />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByLabelText('Theme color')).toHaveTextContent(
        THEME_LIGHT.font.color.primary,
      ),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Use dark theme' }),
    );
    await expect(canvas.getByLabelText('Color scheme')).toHaveTextContent(
      'dark',
    );
    await expect(canvas.getByLabelText('Theme color')).toHaveTextContent(
      THEME_DARK.font.color.primary,
    );
  },
};

export const StaticValues: Story = {
  ...ColorSchemeChanges,
  render: () => <ChangingTheme staticValues />,
};

const NestedThemes = () => {
  const [fontColor, setFontColor] = useState('#f5f5f5');
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <ThemeProvider
      colorScheme="light"
      applyToRoot={false}
      className="outer-theme"
    >
      <section aria-label="Outer theme">
        <ThemeReadout />
      </section>
      <div
        ref={setContainer}
        role="region"
        aria-label="Explicit portal container"
      />
      <ThemeProvider
        colorScheme="dark"
        applyToRoot={false}
        className="inner-theme"
        overrides={{ '--t-font-color-primary': fontColor }}
      >
        <div
          style={{
            background: themeCssVariables.background.primary,
            color: themeCssVariables.font.color.primary,
            padding: 16,
          }}
        >
          <section aria-label="Inner theme">
            <ThemeReadout />
          </section>
          <Button onClick={() => setFontColor('#ededed')}>
            Change override
          </Button>
          <Popover.Root>
            <Popover.Trigger render={<Button>Open scoped portal</Button>} />
            <Popover.Popup>
              <Popover.Title>Scoped portal</Popover.Title>
              <ThemeReadout />
              <Popover.Close render={<Button>Close scoped portal</Button>} />
            </Popover.Popup>
          </Popover.Root>
          <Popover.Root>
            <Popover.Trigger render={<Button>Open explicit portal</Button>} />
            <Popover.Popup container={container}>
              <Popover.Title>Explicit portal</Popover.Title>
              <Popover.Close render={<Button>Close explicit portal</Button>} />
            </Popover.Popup>
          </Popover.Root>
        </div>
      </ThemeProvider>
    </ThemeProvider>
  );
};

export const NestedScopesAndPortals: Story = {
  render: () => <NestedThemes />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const outer = within(canvas.getByRole('region', { name: 'Outer theme' }));
    const inner = within(canvas.getByRole('region', { name: 'Inner theme' }));
    await expect(outer.getByLabelText('Color scheme')).toHaveTextContent(
      'light',
    );
    await expect(inner.getByLabelText('Color scheme')).toHaveTextContent(
      'dark',
    );
    await expect(inner.getByLabelText('Theme scope')).toHaveTextContent(
      'inner-theme',
    );
    await expect(inner.getByLabelText('Theme color')).toHaveTextContent(
      '#f5f5f5',
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change override' }),
    );
    await expect(inner.getByLabelText('Theme color')).toHaveTextContent(
      '#ededed',
    );
    await expect(outer.getByLabelText('Theme color')).toHaveTextContent(
      THEME_LIGHT.font.color.primary,
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Open scoped portal' }),
    );
    const scopedPortal = await canvas.findByRole('dialog', {
      name: 'Scoped portal',
    });
    await expect(canvasElement.querySelector('.inner-theme')).toContainElement(
      scopedPortal,
    );
    await expect(
      within(scopedPortal).getByLabelText('Theme color'),
    ).toHaveTextContent('#ededed');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Close scoped portal' }),
    );
    await waitFor(() => expect(scopedPortal).not.toBeInTheDocument());
    await userEvent.click(
      canvas.getByRole('button', { name: 'Open explicit portal' }),
    );
    const explicitContainer = canvas.getByRole('region', {
      name: 'Explicit portal container',
    });
    const explicitPortal = await within(explicitContainer).findByRole(
      'dialog',
      {
        name: 'Explicit portal',
      },
    );
    await waitFor(() => expect(explicitPortal).toBeVisible());
    await userEvent.click(
      canvas.getByRole('button', { name: 'Close explicit portal' }),
    );
  },
};
