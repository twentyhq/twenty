import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import styles from '../OverflowingTextWithTooltip.module.scss';

import { Tooltip } from '@ui/primitives/surfaces/Tooltip/Tooltip';

import { OverflowingTextWithTooltip } from '../OverflowingTextWithTooltip';

const setTextDimensions = ({
  element,
  clientWidth,
  scrollWidth,
}: {
  element: HTMLElement;
  clientWidth: number;
  scrollWidth: number;
}) => {
  Object.defineProperties(element, {
    clientWidth: { value: clientWidth },
    scrollWidth: { value: scrollWidth },
  });
};

runComponentConformance({
  name: 'OverflowingTextWithTooltip',
  element: <OverflowingTextWithTooltip text="Body" />,
  ownClassName: styles.overflowingText,
  refInstanceOf: HTMLDivElement,
});

describe('OverflowingTextWithTooltip', () => {
  it('keeps URL strings plain inside a caller-provided anchor', () => {
    render(
      <a href="https://twenty.com">
        <OverflowingTextWithTooltip text="https://twenty.com" />
      </a>,
    );

    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link')).toHaveTextContent('https://twenty.com');
  });

  it('preserves explicit child links and their focus without adding a tab stop', async () => {
    const user = userEvent.setup();
    render(
      <OverflowingTextWithTooltip
        text={<a href="https://twenty.com">Documentation</a>}
        tooltipContent="Open the documentation"
        alwaysShowTooltip
        tooltipDelay={0}
        data-testid="text"
      />,
    );

    const link = screen.getByRole('link', { name: 'Documentation' });
    expect(screen.getByTestId('text')).not.toHaveAttribute('tabindex');
    await user.tab();
    expect(link).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Open the documentation',
    );
    await user.hover(link);
    await user.unhover(link);
    expect(screen.getByRole('tooltip')).toBeVisible();
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
    expect(link).toHaveFocus();
  });

  it('targets the rendered anchor with native props, ref and composed handlers', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDivElement>();
    const onFocus = vi.fn();
    const onPointerEnter = vi.fn();
    const onClick = vi.fn((event) => event.preventDefault());
    render(
      <OverflowingTextWithTooltip
        text="Documentation"
        render={<a href="https://twenty.com" aria-label="Documentation" />}
        ref={ref}
        title="Read documentation"
        onFocus={onFocus}
        onPointerEnter={onPointerEnter}
        onClick={onClick}
        tooltipDelay={0}
      />,
    );

    const link = screen.getByRole('link', { name: 'Documentation' });
    setTextDimensions({ element: link, clientWidth: 80, scrollWidth: 160 });
    expect(ref.current).toBe(link);
    expect(link).toHaveAttribute('title', 'Read documentation');
    await user.tab();
    expect(onFocus).toHaveBeenCalledOnce();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Documentation',
    );
    await user.click(link);
    expect(onPointerEnter).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('uses caller tabIndex for focus even when the convenience tab stop is off', async () => {
    const user = userEvent.setup();
    render(
      <OverflowingTextWithTooltip
        text="Keyboard label"
        tabIndex={0}
        alwaysShowTooltip
      />,
    );
    const text = screen.getByText('Keyboard label');
    await user.tab();
    expect(text).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Keyboard label',
    );
  });

  it('does not open without a nonempty tooltip label', async () => {
    const user = userEvent.setup();
    render(
      <OverflowingTextWithTooltip
        text={<span>Value</span>}
        tooltipContent=""
        alwaysShowTooltip
        isFocusable
      />,
    );
    await user.tab();
    await user.hover(screen.getByText('Value'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('lets a parent tooltip open when the nested text fits', async () => {
    const user = userEvent.setup();

    render(
      <Tooltip content="Field label" delay={0}>
        <div>
          <OverflowingTextWithTooltip text="Short value" tooltipDelay={0} />
        </div>
      </Tooltip>,
    );

    const text = screen.getByText('Short value');

    setTextDimensions({ element: text, clientWidth: 100, scrollWidth: 80 });

    await user.hover(text);

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Field label');
  });

  it('gives the nested tooltip priority when its text is truncated', async () => {
    const user = userEvent.setup();

    render(
      <Tooltip content="Field label" delay={0}>
        <div>
          <OverflowingTextWithTooltip text="Truncated value" tooltipDelay={0} />
        </div>
      </Tooltip>,
    );

    const text = screen.getByText('Truncated value');

    setTextDimensions({ element: text, clientWidth: 80, scrollWidth: 160 });

    await user.hover(text);

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Truncated value',
    );
    expect(screen.getAllByRole('tooltip')).toHaveLength(1);
  });

  it('opens only when the text is truncated without adding a layout wrapper', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <OverflowingTextWithTooltip text="Truncated label" tooltipDelay={0} />,
    );
    const text = screen.getByText('Truncated label');

    setTextDimensions({ element: text, clientWidth: 80, scrollWidth: 160 });

    expect(container.firstElementChild).toBe(text);

    await user.hover(text);

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Truncated label',
    );
  });

  it('keeps text that fits hidden on keyboard focus', async () => {
    const user = userEvent.setup();

    render(<OverflowingTextWithTooltip text="Short label" isFocusable />);

    const text = screen.getByText('Short label');

    setTextDimensions({ element: text, clientWidth: 100, scrollWidth: 80 });

    await user.tab();

    expect(text).toHaveFocus();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('opens on focus and dismisses with Escape while retaining focus', async () => {
    const user = userEvent.setup();

    render(
      <OverflowingTextWithTooltip
        text="Short label"
        tooltipContent="Additional information"
        alwaysShowTooltip
        isFocusable
      />,
    );

    const text = screen.getByText('Short label');

    await user.tab();

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Additional information',
    );

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
    expect(text).toHaveFocus();
  });

  it('keeps the tooltip open while a clicked label retains focus', async () => {
    const user = userEvent.setup();

    render(
      <OverflowingTextWithTooltip
        text="Clickable label"
        alwaysShowTooltip
        isFocusable
        tooltipDelay={0}
      />,
    );

    const text = screen.getByText('Clickable label');

    await user.click(text);

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Clickable label',
    );
    expect(text).toHaveFocus();

    await user.unhover(text);

    expect(screen.getByRole('tooltip')).toBeVisible();

    await user.tab();

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('lays out each value by its own direction', () => {
    render(
      <div dir="rtl">
        <OverflowingTextWithTooltip text="Enterprise Workstation Refresh" />
        <OverflowingTextWithTooltip text="הטמעת CRM לאקמה" />
      </div>,
    );

    expect(screen.getByText('Enterprise Workstation Refresh')).toHaveAttribute(
      'dir',
      'auto',
    );
    expect(screen.getByText('הטמעת CRM לאקמה')).toHaveAttribute('dir', 'auto');
  });
});
