import { render, screen, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { DirectionProvider } from '@ui/primitives/layout/DirectionProvider/DirectionProvider';
import { ThemeProvider } from '@ui/theme/ThemeProvider';

import { Menu } from '../Menu';
import { type MenuPortalProps } from '../types/MenuPortalProps';

const MenuContent = ({ container }: Pick<MenuPortalProps, 'container'>) => (
  <Menu.Root open>
    <Menu.Portal container={container}>
      <Menu.Positioner>
        <Menu.Popup aria-label="Actions">
          <Menu.Item>Apply</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
);

describe('Menu portal destinations', () => {
  it('uses the body by default and the theme scope when one is provided', async () => {
    const { container, rerender } = render(<MenuContent />);
    const menu = await screen.findByRole('menu');
    expect(document.body).toContainElement(menu);
    expect(container).not.toContainElement(menu);

    rerender(
      <ThemeProvider colorScheme="dark" applyToRoot={false}>
        <MenuContent />
      </ThemeProvider>,
    );
    expect(container.querySelector('.dark')).toContainElement(
      await screen.findByRole('menu'),
    );
  });

  it('retargets explicit elements and refs, and waits for an explicit null target', async () => {
    const target = document.createElement('div');
    const nextTarget = document.createElement('div');
    document.body.append(target, nextTarget);
    const targetRef = createRef<HTMLDivElement>();
    targetRef.current = nextTarget;
    const { rerender, unmount } = render(<MenuContent container={target} />);

    expect(target).toContainElement(await screen.findByRole('menu'));
    rerender(<MenuContent container={targetRef} />);
    expect(nextTarget).toContainElement(await screen.findByRole('menu'));
    expect(target).toBeEmptyDOMElement();
    rerender(<MenuContent container={null} />);
    await waitFor(() => expect(nextTarget).toBeEmptyDOMElement());
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    rerender(<MenuContent container={target} />);
    expect(target).toContainElement(await screen.findByRole('menu'));
    unmount();
    target.remove();
    nextTarget.remove();
  });

  it('preserves ShadowRoot destinations', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const shadowRoot = host.attachShadow({ mode: 'open' });
    const { unmount } = render(<MenuContent container={shadowRoot} />);

    await waitFor(() =>
      expect(shadowRoot.querySelector('[role="menu"]')).toHaveAttribute(
        'aria-label',
        'Actions',
      ),
    );
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    unmount();
    expect(shadowRoot.childNodes).toHaveLength(0);
    host.remove();
  });

  it('retains mounted content while closed and preserves direction on each host', async () => {
    const portal = createRef<HTMLDivElement>();
    const positioner = createRef<HTMLDivElement>();
    const content = ({
      open,
      direction,
    }: {
      open: boolean;
      direction?: 'ltr';
    }) => (
      <DirectionProvider direction="rtl">
        <Menu.Root open={open}>
          <Menu.Portal
            ref={portal}
            {...(direction === 'ltr' ? { dir: direction } : {})}
            keepMounted
          >
            <Menu.Positioner
              ref={positioner}
              {...(direction === 'ltr' ? { dir: direction } : {})}
            >
              <Menu.Popup aria-label="Actions" />
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </DirectionProvider>
    );
    const { rerender } = render(content({ open: true }));

    await screen.findByRole('menu');
    expect(portal.current).toHaveAttribute('dir', 'rtl');
    expect(positioner.current).toHaveAttribute('dir', 'rtl');
    rerender(content({ open: false, direction: 'ltr' }));
    await waitFor(() => expect(positioner.current).toHaveAttribute('hidden'));
    expect(screen.getByRole('menu', { hidden: true })).toBeInTheDocument();
    expect(portal.current).toHaveAttribute('dir', 'ltr');
    expect(positioner.current).toHaveAttribute('dir', 'ltr');
  });
});

describe('Menu positioning composition', () => {
  it('retains function offsets, virtual anchors, fixed positioning and stateful styles', async () => {
    const positioner = createRef<HTMLDivElement>();
    const popup = createRef<HTMLDivElement>();
    const sideOffset = vi.fn(() => 10);
    const alignOffset = vi.fn(() => 4);
    const anchor = {
      getBoundingClientRect: () => new DOMRect(40, 50, 80, 20),
    };
    render(
      <Menu.Root open>
        <Menu.Portal>
          <Menu.Positioner
            ref={positioner}
            anchor={anchor}
            positionMethod="fixed"
            side="bottom"
            align="start"
            sideOffset={sideOffset}
            alignOffset={alignOffset}
            collisionAvoidance={{ side: 'none', align: 'none' }}
            collisionBoundary={{ x: 0, y: 0, width: 500, height: 500 }}
            collisionPadding={{ top: 1, right: 2, bottom: 3, left: 4 }}
            arrowPadding={7}
            sticky
            disableAnchorTracking
            className={({ side, open }) =>
              `${side}-${open ? 'open' : 'closed'}`
            }
            style={({ open }) => ({ marginTop: open ? 7 : 0 })}
          >
            <Menu.Popup ref={popup} aria-label="Actions">
              <Menu.Arrow />
              <Menu.Item>Apply</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>,
    );

    await screen.findByRole('menu');
    await waitFor(() => expect(sideOffset).toHaveBeenCalled());
    expect(alignOffset).toHaveBeenCalledWith(
      expect.objectContaining({
        side: 'bottom',
        align: 'start',
        anchor: { width: 80, height: 20 },
        positioner: { width: 0, height: 0 },
      }),
    );
    expect(positioner.current).toHaveStyle({
      position: 'fixed',
      marginTop: '7px',
    });
    expect(positioner.current).toHaveClass('bottom-open');
    expect(positioner.current).toHaveAttribute('data-side', 'bottom');
    expect(positioner.current).toHaveAttribute('data-align', 'start');
    expect(popup.current).toHaveAttribute('data-side', 'bottom');
    expect(popup.current).toHaveAttribute('data-align', 'start');
  });
});
