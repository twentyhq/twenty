import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactElement } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';

import { Dropdown } from '../Dropdown';

const renderDisabledSubmenu = (owner?: ReactElement) => {
  const onOpenChange = vi.fn();
  const onClick = vi.fn();
  const onTriggerRef = vi.fn();

  render(
    <Dropdown.Root type="menu">
      <Dropdown.Submenu onOpenChange={onOpenChange}>
        <Dropdown.SubmenuTrigger
          disabled
          nativeButton
          render={owner}
          ref={onTriggerRef}
          onClick={onClick}
        >
          Unavailable actions
        </Dropdown.SubmenuTrigger>
      </Dropdown.Submenu>
    </Dropdown.Root>,
  );

  return { onClick, onOpenChange, onTriggerRef };
};

describe('disabled Dropdown submenu owners', () => {
  it.each([
    { name: 'default button', owner: undefined },
    { name: 'custom native button', owner: <Button /> },
  ])('keeps $name disabled and forwards its native ref', async ({ owner }) => {
    const user = userEvent.setup();
    const { onClick, onOpenChange, onTriggerRef } =
      renderDisabledSubmenu(owner);
    const trigger = screen.getByRole('menuitem', {
      name: 'Unavailable actions',
    });

    expect(trigger).toBeDisabled();
    expect(onTriggerRef).toHaveBeenCalledWith(trigger);
    await user.click(trigger);
    await user.hover(trigger);
    expect(onClick).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
