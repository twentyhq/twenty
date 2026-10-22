import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { OverflowingTextTooltipModeProvider } from '../OverflowingTextTooltipModeProvider';
import { OverflowingTextWithTooltip } from '../OverflowingTextWithTooltip';

import styles from '../OverflowingTextWithTooltip.module.scss';

runComponentConformance({
  name: 'OverflowingTextWithTooltip',
  element: <OverflowingTextWithTooltip text="Body" />,
  ownClassName: styles.overflowingText,
  refInstanceOf: HTMLDivElement,
});

describe('OverflowingTextWithTooltip', () => {
  it('forwards semantic typography to the displayed text without adding native attributes', () => {
    render(
      <OverflowingTextWithTooltip
        text="Caption"
        size="xs"
        weight="semibold"
        color="light"
        render={<span />}
      />,
    );

    const text = screen.getByText('Caption');

    expect(text.tagName).toBe('SPAN');
    expect(text).toHaveAttribute('data-size', 'xs');
    expect(text).toHaveAttribute('data-weight', 'semibold');
    expect(text).toHaveAttribute('data-color', 'light');
    expect(text).not.toHaveAttribute('size');
    expect(text).not.toHaveAttribute('weight');
    expect(text).not.toHaveAttribute('color');
  });

  it('keeps URL strings plain inside a caller-provided anchor', () => {
    render(
      <a href="https://twenty.com">
        <OverflowingTextWithTooltip text="https://twenty.com" />
      </a>,
    );

    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link')).toHaveTextContent('https://twenty.com');
  });

  it('preserves explicit child links without adding a tab stop', () => {
    render(
      <OverflowingTextWithTooltip
        text={<a href="https://twenty.com">Documentation</a>}
        tooltipContent="Open the documentation"
        alwaysShowTooltip
        data-testid="text"
      />,
    );

    expect(screen.getByTestId('text')).not.toHaveAttribute('tabindex');
    expect(screen.getByRole('link', { name: 'Documentation' })).toHaveAttribute(
      'href',
      'https://twenty.com',
    );
  });

  it('targets the rendered anchor with native props and ref', () => {
    const ref = createRef<HTMLDivElement>();

    render(
      <OverflowingTextWithTooltip
        text="Documentation"
        render={<a href="https://twenty.com" aria-label="Documentation" />}
        ref={ref}
        title="Read documentation"
      />,
    );

    const link = screen.getByRole('link', { name: 'Documentation' });

    expect(ref.current).toBe(link);
    expect(link).toHaveAttribute('title', 'Read documentation');
  });

  it('renders the displayed text without a layout wrapper', () => {
    const { container } = render(
      <OverflowingTextWithTooltip text="Truncated label" />,
    );

    expect(container.firstElementChild).toBe(
      screen.getByText('Truncated label'),
    );
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

  it('preserves the text element and ref when the tooltip mode is disabled', () => {
    const ref = createRef<HTMLDivElement>();

    render(
      <OverflowingTextTooltipModeProvider mode="disabled">
        <OverflowingTextWithTooltip
          text="Truncated label"
          ref={ref}
          alwaysShowTooltip
          isFocusable
        />
      </OverflowingTextTooltipModeProvider>,
    );

    expect(ref.current).toBe(screen.getByText('Truncated label'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
