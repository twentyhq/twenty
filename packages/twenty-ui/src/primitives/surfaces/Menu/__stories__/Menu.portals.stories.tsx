import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { ComponentDecorator } from '@ui/testing';
import { ThemeProvider } from '@ui/theme/ThemeProvider';

import { Menu } from '../Menu';
import { type MenuPortalProps } from '../types/MenuPortalProps';

const PortalMenu = ({ container }: Pick<MenuPortalProps, 'container'>) => {
  const triggerId = useId();

  return (
    <Menu.Root open triggerId={triggerId}>
      <Menu.Trigger id={triggerId} render={<Button>Options</Button>} />
      <Menu.Portal container={container}>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.Item>Export</Menu.Item>
            <Menu.Item>Share</Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
};

const meta: Meta<typeof PortalMenu> = {
  title: 'UI/Surfaces/Menu/Portals',
  component: PortalMenu,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 260, height: 240 } },
};

export default meta;
type Story = StoryObj<typeof PortalMenu>;

export const Body: Story = {
  play: async ({ canvasElement }) => {
    const menu = await within(canvasElement.ownerDocument.body).findByRole(
      'menu',
      { name: 'Options' },
    );
    expect(menu).toBeVisible();
    expect(canvasElement).not.toContainElement(menu);
  },
};

const ExplicitContainerMenu = () => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <>
      <PortalMenu container={container} />
      <div ref={setContainer} role="region" aria-label="Menu portal" />
    </>
  );
};

export const ExplicitContainer: Story = {
  render: () => <ExplicitContainerMenu />,
  play: async ({ canvasElement }) => {
    const container = within(canvasElement).getByRole('region', {
      name: 'Menu portal',
    });
    expect(
      await within(container).findByRole('menu', { name: 'Options' }),
    ).toBeVisible();
  },
};

export const ScopedTheme: Story = {
  render: () => (
    <section aria-label="Scoped theme">
      <ThemeProvider colorScheme="dark" applyToRoot={false}>
        <div
          style={{
            background: 'var(--t-background-primary)',
            width: 260,
            height: 240,
          }}
        >
          <PortalMenu />
        </div>
      </ThemeProvider>
    </section>
  ),
  play: async ({ canvasElement }) => {
    const scope = within(canvasElement).getByRole('region', {
      name: 'Scoped theme',
    });
    expect(
      await within(scope).findByRole('menu', { name: 'Options' }),
    ).toBeVisible();
  },
};

export const InheritedDirection: Story = {
  render: () => (
    <section aria-label="Right-to-left container" dir="rtl">
      <ThemeProvider colorScheme="light" applyToRoot={false}>
        <div style={{ width: 260, height: 240 }}>
          <PortalMenu />
        </div>
      </ThemeProvider>
    </section>
  ),
  play: async ({ canvasElement }) => {
    const scope = within(canvasElement).getByRole('region', {
      name: 'Right-to-left container',
    });
    const menu = await within(scope).findByRole('menu', { name: 'Options' });
    expect(getComputedStyle(menu).direction).toBe('rtl');
  },
};

const DeferredContainerMenu = () => {
  const [showContainer, setShowContainer] = useState(false);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <ThemeProvider colorScheme="light" applyToRoot={false}>
      <PortalMenu container={container} />
      <Button onClick={() => setShowContainer(true)}>
        Create portal container
      </Button>
      {showContainer && (
        <div
          ref={setContainer}
          role="region"
          aria-label="Deferred menu portal"
        />
      )}
    </ThemeProvider>
  );
};

export const DeferredContainer: Story = {
  render: () => <DeferredContainerMenu />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(
      within(canvasElement.ownerDocument.body).queryByRole('menu'),
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Create portal container' }),
    );
    const container = canvas.getByRole('region', {
      name: 'Deferred menu portal',
    });
    expect(
      await within(container).findByRole('menu', { name: 'Options' }),
    ).toBeVisible();
  },
};
