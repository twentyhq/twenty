import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, type FormEvent, type MouseEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { ListItem } from '../ListItem';
import styles from '../ListItem.module.scss';

runComponentConformance({
  name: 'ListItem',
  element: <ListItem>Item</ListItem>,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.root,
});

describe('ListItem interaction ownership', () => {
  it('forwards the native click and lets the caller choose propagation', async () => {
    const user = userEvent.setup();
    const onParentClick = vi.fn();
    const onAction = vi.fn();
    let receivedTarget: EventTarget | null = null;
    let receivedEvent: MouseEvent<HTMLElement> | undefined;

    render(
      <button type="button" onClick={onParentClick}>
        <ListItem
          render={<span />}
          onClick={(event) => {
            receivedTarget = event.currentTarget;
            receivedEvent = event;
            onAction();
          }}
        >
          Archive
        </ListItem>
        <ListItem
          render={<span />}
          onClick={(event) => event.stopPropagation()}
        >
          Local action
        </ListItem>
      </button>,
    );

    const archive = screen.getByText('Archive');
    await user.click(archive);

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onParentClick).toHaveBeenCalledTimes(1);
    expect(receivedTarget).toContainElement(archive);
    expect(receivedEvent?.nativeEvent).toBeInstanceOf(window.MouseEvent);
    expect(receivedEvent?.defaultPrevented).toBe(false);
    expect(receivedEvent?.isPropagationStopped()).toBe(false);

    await user.click(screen.getByText('Local action'));

    expect(onParentClick).toHaveBeenCalledTimes(1);
  });

  it('keeps visual state independent of interaction and accessibility semantics', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const ref = createRef<HTMLDivElement>();

    render(
      <ListItem
        disabled
        focused
        selected
        indicator="checkbox"
        ref={ref}
        onClick={onAction}
      >
        Delete
      </ListItem>,
    );

    expect(ref.current).not.toHaveAttribute('role');
    expect(ref.current).not.toHaveAttribute('tabindex');
    expect(ref.current).not.toHaveAttribute('aria-disabled');
    expect(ref.current).not.toHaveAttribute('aria-selected');
    expect(ref.current).toHaveAttribute('data-disabled');
    expect(ref.current).toHaveAttribute('data-highlighted');
    expect(ref.current).toHaveAttribute('data-selected');
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

    await user.click(screen.getByText('Delete'));
    expect(onAction).toHaveBeenCalledTimes(1);

    await user.tab();
    expect(ref.current).not.toHaveFocus();
  });

  it('targets the native button owner and retains form, focus and keyboard events', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLButtonElement>();
    const ownerRef = createRef<HTMLButtonElement>();
    const onAction = vi.fn();
    const onOwnerClick = vi.fn();
    const onFocus = vi.fn();
    const onKeyDown = vi.fn();
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) =>
      event.preventDefault(),
    );

    render(
      <form onSubmit={onSubmit}>
        <ListItem
          render={
            <button
              type="submit"
              name="action"
              value="archive"
              ref={ownerRef}
              onClick={onOwnerClick}
            />
          }
          ref={ref}
          onClick={onAction}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
        >
          Archive
        </ListItem>
        <ListItem
          disabled
          render={<button type="button" disabled />}
          onClick={onAction}
        >
          Delete
        </ListItem>
      </form>,
    );

    const button = screen.getByRole('button', { name: 'Archive' });
    expect(ref.current).toBe(button);
    expect(ownerRef.current).toBe(button);
    expect(button).toHaveAttribute('name', 'action');
    expect(button).toHaveAttribute('value', 'archive');

    await user.tab();
    expect(button).toHaveFocus();
    expect(onFocus).toHaveBeenCalledTimes(1);
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onAction).toHaveBeenCalledTimes(2);
    expect(onOwnerClick).toHaveBeenCalledTimes(2);
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(onKeyDown).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onAction).toHaveBeenCalledTimes(2);
  });

  it('retains explicit native links while URL labels stay plain text', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLAnchorElement>();
    const onLinkClick = vi.fn((event: MouseEvent<HTMLElement>) =>
      event.preventDefault(),
    );

    render(
      <>
        <ListItem>https://twenty.com/plain</ListItem>
        <ListItem
          render={(renderProps) => (
            <a
              {...renderProps}
              href="https://twenty.com/docs"
              target="_blank"
              rel="noreferrer"
            >
              {renderProps.children}
            </a>
          )}
          ref={ref}
          onClick={onLinkClick}
        >
          Documentation
        </ListItem>
        <ListItem>
          <a href="https://twenty.com/help">Help</a>
        </ListItem>
      </>,
    );

    const link = screen.getByRole('link', { name: 'Documentation' });
    expect(ref.current).toBe(link);
    expect(link).toHaveAttribute('href', 'https://twenty.com/docs');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(
      screen.getByText('https://twenty.com/plain').closest('a'),
    ).toBeNull();
    expect(
      screen.getByRole('link', { name: 'Help' }).querySelector('a'),
    ).toBeNull();

    await user.tab();
    expect(link).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onLinkClick).toHaveBeenCalledTimes(1);
  });
});

describe('ListItem content', () => {
  it('gives a truncated text label a tooltip and leaves other content untouched', async () => {
    const user = userEvent.setup();

    render(
      <>
        <ListItem>Rename</ListItem>
        <ListItem>
          <span data-testid="custom-label">Custom</span>
        </ListItem>
      </>,
    );

    const label = screen.getByText('Rename');

    Object.defineProperties(label, {
      clientWidth: { value: 40 },
      scrollWidth: { value: 80 },
    });

    await user.hover(label);

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Rename');
    expect(screen.getByTestId('custom-label')).toBeInTheDocument();
  });
});
