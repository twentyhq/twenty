import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';
import { ThemeProvider } from '@ui/theme-constants/ThemeProvider';

import { Menu } from '../Menu';
import { type MenuPopupProps } from '../types/MenuPopupProps';

const PortalMenu = ({ container }: Pick<MenuPopupProps, 'container'>) => {
  const triggerId = useId();

  return (
    <Menu.Root open triggerId={triggerId}>
      <Menu.Trigger id={triggerId}>Options</Menu.Trigger>
      <Menu.Popup container={container}>
        <Menu.Item>Export</Menu.Item>
        <Menu.Item>Share</Menu.Item>
      </Menu.Popup>
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

const DeferredContainerMenu = () => {
  const [showContainer, setShowContainer] = useState(false);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <ThemeProvider colorScheme="light" applyToRoot={false}>
      <PortalMenu container={container} />
      <button type="button" onClick={() => setShowContainer(true)}>
        Create portal container
      </button>
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
