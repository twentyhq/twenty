import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { IconCoins } from '@ui/icon';

import { Badge } from '../Badge';
import styles from '../Badge.module.scss';

runComponentConformance({
  name: 'Badge',
  element: <Badge>Soon</Badge>,
  refInstanceOf: HTMLSpanElement,
  ownClassName: styles.badge,
  renderPropTagName: 'button',
});

describe('Badge content and composition', () => {
  it('displays caller-provided nodes and zero without count policies', () => {
    render(
      <>
        <Badge>
          <IconCoins aria-hidden="true" size={12} />
          <strong>+2 credits</strong>
        </Badge>
        <Badge>{0}</Badge>
        <Badge>99+</Badge>
      </>,
    );

    expect(screen.getByText('+2 credits').tagName).toBe('STRONG');
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('keeps a span when native event handlers are supplied', async () => {
    const onClick = vi.fn();
    const onMouseEnter = vi.fn();
    const ref = createRef<HTMLSpanElement>();

    render(
      <Badge ref={ref} onClick={onClick} onMouseEnter={onMouseEnter}>
        Soon
      </Badge>,
    );

    const badge = screen.getByText('Soon');
    await userEvent.click(badge);

    expect(badge.tagName).toBe('SPAN');
    expect(badge).not.toHaveAttribute('tabindex');
    expect(ref.current).toBe(badge);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onMouseEnter).toHaveBeenCalledTimes(1);
  });

  it('uses the explicit native button owner for keyboard activation and refs', async () => {
    const onClick = vi.fn();
    const onRenderClick = vi.fn();
    const ref = createRef<HTMLElement>();

    render(
      <Badge
        ref={ref}
        render={<button type="button" onClick={onRenderClick} />}
        onClick={onClick}
      >
        Review credits
      </Badge>,
    );

    const button = screen.getByRole('button', { name: 'Review credits' });
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');

    expect(button).toHaveFocus();
    expect(ref.current).toBe(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onRenderClick).toHaveBeenCalledTimes(1);
  });

  it('merges native link attributes and handlers from callback composition', async () => {
    const onClick = vi.fn();
    const ref = createRef<HTMLElement>();

    render(
      <Badge
        ref={ref}
        onClick={onClick}
        render={(props) => (
          <a {...props} href="#credits">
            {props.children}
          </a>
        )}
      >
        Credits
      </Badge>,
    );

    const link = screen.getByRole('link', { name: 'Credits' });
    await userEvent.click(link);

    expect(link).toHaveAttribute('href', '#credits');
    expect(ref.current).toBe(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
