import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Text } from '@ui/primitives/typography/Text/Text';
import { Button } from '@ui/primitives/input/Button/Button';
import { DirectionProvider } from '@ui/primitives/layout/DirectionProvider/DirectionProvider';
import { Card } from '@ui/primitives/surfaces/Card/Card';
import { ComponentDecorator } from '@ui/testing';
import { ThemeProvider } from '@ui/theme/ThemeProvider';

import { Popover } from '../Popover';

const meta: Meta = {
  title: 'UI/Surfaces/Popover/Parts',
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj;

const NativePartsExample = () => {
  const portalRef = useRef<HTMLDivElement>(null);
  const positionerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [targets, setTargets] = useState('');

  return (
    <Popover.Root defaultOpen>
      <Popover.Trigger render={<Button>Inspect parts</Button>} />
      <Popover.Portal ref={portalRef} data-part="portal" render={<section />}>
        <Popover.Positioner
          ref={positionerRef}
          data-part="positioner"
          className={({ open }) => (open ? 'open-positioner' : '')}
          style={({ side }) => ({ marginTop: side === 'bottom' ? 3 : 0 })}
          render={(props, state) => (
            <section {...props} data-open={state.open} />
          )}
        >
          <Popover.Popup ref={popupRef} data-part="popup" render={<article />}>
            <Popover.Arrow ref={arrowRef} data-part="arrow" render={<span />} />
            <Popover.Viewport ref={viewportRef} render={<section />}>
              <Popover.Title>Part targets</Popover.Title>
              <Popover.Description>
                Each ref targets its own element.
              </Popover.Description>
              <Button
                onClick={() =>
                  setTargets(
                    [
                      portalRef.current?.localName,
                      positionerRef.current?.localName,
                      popupRef.current?.localName,
                      arrowRef.current?.localName,
                      viewportRef.current?.localName,
                    ].join(', '),
                  )
                }
              >
                Read refs
              </Button>
              <Text render={<output />}>{targets}</Text>
              <Popover.Close render={<Button>Close</Button>} />
            </Popover.Viewport>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
};

export const NativeParts: Story = {
  render: () => <NativePartsExample />,
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const popup = await page.findByRole('dialog', { name: 'Part targets' });
    await waitFor(() => expect(popup).toBeVisible());
    expect(popup.tagName).toBe('ARTICLE');
    const positioner = popup.parentElement;
    expect(positioner).toHaveAttribute('data-part', 'positioner');
    expect(positioner).toHaveAttribute('data-open', 'true');
    expect(positioner).toHaveClass('open-positioner');
    expect(positioner).toHaveStyle({ marginTop: '3px' });
    expect(positioner?.parentElement).toHaveAttribute('data-part', 'portal');
    await userEvent.click(page.getByRole('button', { name: 'Read refs' }));
    expect(page.getByRole('status')).toHaveTextContent(
      'section, section, article, span, section',
    );
    await userEvent.click(page.getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

const AdvancedAnchorExample = () => {
  const [avoidCollisions, setAvoidCollisions] = useState(false);

  return (
    <>
      <Button onClick={() => setAvoidCollisions(true)}>Avoid collisions</Button>
      <Popover.Root open>
        <Popover.Portal>
          <Popover.Positioner
            anchor={() => ({
              getBoundingClientRect: () => new DOMRect(280, 240, 40, 24),
            })}
            positionMethod="fixed"
            side="bottom"
            align="start"
            sideOffset={({ anchor }) => anchor.height / 2}
            alignOffset={({ anchor }) => anchor.width / 4}
            collisionBoundary={{ x: 120, y: 100, width: 240, height: 190 }}
            collisionPadding={10}
            collisionAvoidance={{
              side: avoidCollisions ? 'flip' : 'none',
              align: 'shift',
            }}
            arrowPadding={12}
            sticky={false}
            disableAnchorTracking
          >
            <Popover.Popup
              aria-label="Advanced anchor"
              style={{ width: 120, height: 60, boxSizing: 'border-box' }}
            >
              <Popover.Arrow />
              <Text>Virtual anchor</Text>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </>
  );
};

export const AdvancedAnchor: Story = {
  render: () => <AdvancedAnchorExample />,
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const popup = await page.findByRole('dialog', { name: 'Advanced anchor' });
    const positioner = popup.parentElement;
    await waitFor(() => {
      expect(popup).toBeVisible();
      expect(positioner).toHaveStyle({ position: 'fixed' });
      expect(positioner?.getBoundingClientRect().top).toBeCloseTo(276, 0);
    });
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Avoid collisions' }),
    );
    await waitFor(() => {
      expect(popup).toHaveAttribute('data-side', 'top');
      const rectangle = popup.getBoundingClientRect();
      expect(rectangle.left).toBeGreaterThanOrEqual(130);
      expect(rectangle.right).toBeLessThanOrEqual(350);
      expect(rectangle.bottom).toBeCloseTo(228, 0);
    });
  },
};

const ScopedDestinationsExample = () => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [destination, setDestination] = useState<
    'omitted' | 'waiting' | 'explicit'
  >('omitted');

  return (
    <DirectionProvider direction="rtl">
      <ThemeProvider
        colorScheme="dark"
        applyToRoot={false}
        overrides={{ '--t-font-color-primary': 'rgb(220, 230, 240)' }}
      >
        <Card.Root
          style={{ background: 'var(--t-background-primary)', padding: 24 }}
        >
          <Button onClick={() => setDestination('waiting')}>
            Wait for target
          </Button>
          <Button onClick={() => setDestination('explicit')}>
            Use explicit target
          </Button>
          <div
            ref={setContainer}
            role="region"
            aria-label="Explicit themed target"
          />
          <Popover.Root open>
            <Popover.Trigger render={<Button>Scoped anchor</Button>} />
            <Popover.Portal
              container={
                destination === 'omitted'
                  ? undefined
                  : destination === 'waiting'
                    ? null
                    : container
              }
            >
              <Popover.Positioner
                side="inline-start"
                collisionAvoidance={{ side: 'none', align: 'none' }}
              >
                <Popover.Popup
                  aria-label="Scoped details"
                  style={{ background: 'var(--t-background-primary)' }}
                >
                  <Text>Themed content</Text>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        </Card.Root>
      </ThemeProvider>
    </DirectionProvider>
  );
};

export const ScopedDestinations: Story = {
  render: () => <ScopedDestinationsExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const popup = await page.findByRole('dialog', { name: 'Scoped details' });
    await waitFor(() => expect(popup).toBeVisible());
    expect(canvasElement).toContainElement(popup);
    expect(popup).toHaveStyle({ color: 'rgb(220, 230, 240)' });
    expect(popup.parentElement).toHaveAttribute('dir', 'rtl');
    expect(popup).toHaveAttribute('data-side', 'inline-start');
    const anchor = canvas.getByRole('button', { name: 'Scoped anchor' });
    await waitFor(() =>
      expect(popup.getBoundingClientRect().left).toBeCloseTo(
        anchor.getBoundingClientRect().right + 8,
        0,
      ),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Wait for target' }),
    );
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Use explicit target' }),
    );
    const target = canvas.getByRole('region', {
      name: 'Explicit themed target',
    });
    const relocatedPopup = await within(target).findByRole('dialog');
    await waitFor(() => expect(relocatedPopup).toBeVisible());
    expect(relocatedPopup).toHaveStyle({ color: 'rgb(220, 230, 240)' });
    expect(relocatedPopup.parentElement).toHaveAttribute('dir', 'rtl');
  },
};

const FocusTargetsExample = () => {
  const firstActionRef = useRef<HTMLButtonElement>(null);
  const returnRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Popover.Root>
        <Popover.Trigger render={<Button>Open focus targets</Button>} />
        <Popover.Portal>
          <Popover.Positioner>
            <Popover.Popup
              aria-label="Focus targets"
              initialFocus={firstActionRef}
              finalFocus={returnRef}
            >
              <Button>Other action</Button>
              <Button ref={firstActionRef}>Initial action</Button>
              <Popover.Close render={<Button>Close focus targets</Button>} />
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
      <Button ref={returnRef}>Return here</Button>
    </>
  );
};

export const FocusTargets: Story = {
  render: () => <FocusTargetsExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Open focus targets' }),
    );
    await waitFor(() =>
      expect(
        page.getByRole('button', { name: 'Initial action' }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(page.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Return here' })).toHaveFocus(),
    );
  },
};
