import { render, screen } from '@testing-library/react';
import { createRef, type ReactNode } from 'react';
import { expect, it } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { IconInfoCircle } from '@ui/icon';

import { Tooltip } from '../Tooltip';
import styles from '../Tooltip.module.scss';

const TooltipRootWrapper = ({ children }: { children: ReactNode }) => (
  <Tooltip.Root>{children}</Tooltip.Root>
);

const OpenTooltipWrapper = ({ children }: { children: ReactNode }) => (
  <Tooltip.Root open>
    <Tooltip.Portal>
      <Tooltip.Positioner>{children}</Tooltip.Positioner>
    </Tooltip.Portal>
  </Tooltip.Root>
);

runComponentConformance({
  name: 'Tooltip.Trigger',
  element: <Tooltip.Trigger>Details</Tooltip.Trigger>,
  refInstanceOf: HTMLButtonElement,
  wrapper: TooltipRootWrapper,
  renderPropTagName: 'button',
});

runComponentConformance({
  name: 'Tooltip.Popup',
  element: <Tooltip.Popup />,
  refInstanceOf: HTMLDivElement,
  wrapper: OpenTooltipWrapper,
  ownClassName: styles.popup,
});

runComponentConformance({
  name: 'Tooltip.Body',
  element: <Tooltip.Body>Details</Tooltip.Body>,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.content,
});

it('renders a description without adding an absent title or icon', () => {
  const { container } = render(
    <Tooltip.Body
      description="Only workspace members can export records."
      startIcon={<IconInfoCircle />}
    />,
  );

  expect(
    screen.getByText('Only workspace members can export records.'),
  ).toBeInTheDocument();
  expect(container.querySelector('svg')).toBeNull();
});

const PopupWrapper = ({ children }: { children: ReactNode }) => (
  <OpenTooltipWrapper>
    <Tooltip.Popup>{children}</Tooltip.Popup>
  </OpenTooltipWrapper>
);

runComponentConformance({
  name: 'Tooltip.Portal',
  element: <Tooltip.Portal />,
  refInstanceOf: HTMLDivElement,
  wrapper: ({ children }) => <Tooltip.Root open>{children}</Tooltip.Root>,
});

runComponentConformance({
  name: 'Tooltip.Positioner',
  element: <Tooltip.Positioner />,
  refInstanceOf: HTMLDivElement,
  wrapper: ({ children }) => (
    <Tooltip.Root open>
      <Tooltip.Portal>{children}</Tooltip.Portal>
    </Tooltip.Root>
  ),
  ownClassName: styles.positioner,
});

runComponentConformance({
  name: 'Tooltip.Arrow',
  element: <Tooltip.Arrow />,
  refInstanceOf: HTMLDivElement,
  wrapper: PopupWrapper,
  ownClassName: styles.arrow,
});

runComponentConformance({
  name: 'Tooltip.Viewport',
  element: <Tooltip.Viewport>Details</Tooltip.Viewport>,
  refInstanceOf: HTMLDivElement,
  wrapper: PopupWrapper,
});

runComponentConformance({
  name: 'Tooltip',
  element: (
    <Tooltip content="Details" open>
      <button type="button">Trigger</button>
    </Tooltip>
  ),
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.popup,
});

it('uses the existing child as its trigger', () => {
  const { container } = render(
    <Tooltip content="Account details">
      <button type="button">Account</button>
    </Tooltip>,
  );

  expect(container.firstElementChild).toBe(
    screen.getByRole('button', { name: 'Account' }),
  );
});

it('targets native props, render composition and refs at each shorthand part', () => {
  const triggerRef = createRef<HTMLButtonElement>();
  const positionerRef = createRef<HTMLDivElement>();
  const portalRef = createRef<HTMLDivElement>();
  const popupRef = createRef<HTMLDivElement>();
  render(
    <Tooltip
      content="Hint"
      open
      ref={popupRef}
      render={<section />}
      aria-label="Popup"
      triggerProps={{
        ref: triggerRef,
        'aria-label': 'Trigger',
        render: (props) => <button {...props} type="button" />,
      }}
      positionerProps={{
        ref: positionerRef,
        'aria-label': 'Positioner',
        style: { maxWidth: 240 },
      }}
      portalProps={{ ref: portalRef, 'aria-label': 'Portal' }}
    >
      <button type="button">Original</button>
    </Tooltip>,
  );
  expect(triggerRef.current).toBe(screen.getByLabelText('Trigger'));
  expect(positionerRef.current).toBe(screen.getByLabelText('Positioner'));
  expect(positionerRef.current).toHaveStyle({ maxWidth: '240px' });
  expect(portalRef.current).toBe(screen.getByLabelText('Portal'));
  expect(popupRef.current).toBe(screen.getByLabelText('Popup'));
  expect(popupRef.current?.localName).toBe('section');
});
