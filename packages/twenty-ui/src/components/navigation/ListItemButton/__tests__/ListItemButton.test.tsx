import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';

import { ListItemButton } from '../ListItemButton';

describe('ListItemButton', () => {
  it('activates with pointer, Enter and Space without submitting its form', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onSubmit = vi.fn();

    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <ListItemButton onClick={onClick}>Duplicate</ListItemButton>
      </form>,
    );

    await user.click(screen.getByRole('button', { name: 'Duplicate' }));
    await user.keyboard('{Enter} ');

    expect(onClick).toHaveBeenCalledTimes(3);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables interaction and skips the row in the tab order', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <>
        <ListItemButton disabled onClick={onClick}>
          Unavailable action
        </ListItemButton>
        <ListItemButton>Available action</ListItemButton>
      </>,
    );

    const unavailable = screen.getByRole('button', {
      name: 'Unavailable action',
    });

    expect(unavailable).toBeDisabled();
    expect(unavailable).toHaveAttribute('data-disabled');
    await user.click(unavailable);
    await user.tab();
    expect(
      screen.getByRole('button', { name: 'Available action' }),
    ).toHaveFocus();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards the button ref and native events while preserving bubbling', async () => {
    const user = userEvent.setup();
    const buttonRef = createRef<HTMLButtonElement>();
    const onParentClick = vi.fn();
    const onClick = vi.fn();

    const { container } = render(
      <ListItemButton
        ref={buttonRef}
        name="duplicate"
        onClick={(event) => {
          expect(event.currentTarget).toBe(buttonRef.current);
          expect(event.defaultPrevented).toBe(false);
          onClick();
        }}
      >
        Duplicate
      </ListItemButton>,
    );
    container.addEventListener('click', onParentClick);

    const button = screen.getByRole('button', { name: 'Duplicate' });

    expect(buttonRef.current).toBe(button);
    expect(button).toHaveAttribute('name', 'duplicate');
    await user.click(button);
    expect(onClick).toHaveBeenCalledOnce();
    expect(onParentClick).toHaveBeenCalledOnce();
  });

  it('keeps focusable disabled rows reachable without activating them', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <ListItemButton disabled focusableWhenDisabled onClick={onClick}>
        Unavailable action
      </ListItemButton>,
    );

    const button = screen.getByRole('button', {
      name: 'Unavailable action',
    });

    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('data-disabled');
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard('{Enter} ');
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
