import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MenuItemSelect } from '@ui/navigation/MenuItemSelect/MenuItemSelect';

describe('MenuItemSelect', () => {
  it('renders custom leading content and keeps the option selectable', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <MenuItemSelect
        text="Fast"
        selected={false}
        LeftComponent={<span role="img" aria-label="Speed indicator" />}
        onClick={onClick}
      />,
    );

    expect(screen.getByRole('img', { name: 'Speed indicator' })).toBeVisible();
    const option = screen.getByRole('option', { name: 'Speed indicator Fast' });
    expect(option).toHaveAttribute('aria-selected', 'false');
    await user.click(option);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('preserves text-only selected options', () => {
    render(<MenuItemSelect text="Balanced" selected />);

    expect(screen.getByRole('option', { name: 'Balanced' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });
});
