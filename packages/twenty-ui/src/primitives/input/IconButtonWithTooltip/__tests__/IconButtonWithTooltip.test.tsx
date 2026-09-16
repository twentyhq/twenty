import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { IconButtonWithTooltip } from '../IconButtonWithTooltip';

describe('IconButtonWithTooltip', () => {
  it('shows a tooltip on keyboard focus without changing button clicks', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <IconButtonWithTooltip
        ariaLabel="Search"
        tooltipContent="Search records"
        onClick={onClick}
        tooltipDelay={0}
      />,
    );

    const button = screen.getByRole('button', { name: 'Search' });

    await user.tab();

    expect(button).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Search records',
    );

    await user.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('shows the disabled explanation on hover and keeps the button disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <IconButtonWithTooltip
        ariaLabel="Search"
        tooltipContent="Search is unavailable"
        disabled
        onClick={onClick}
        tooltipDelay={0}
      />,
    );

    const button = screen.getByRole('button', { name: 'Search' });

    await user.hover(button);

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Search is unavailable',
    );
    expect(button).toBeDisabled();

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });
});
