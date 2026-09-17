import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { IconSearch } from '@ui/icon';

import { IconButton } from '../IconButton';
import styles from '../IconButton.module.scss';

runComponentConformance({
  name: 'IconButton',
  element: (
    <IconButton aria-label="Search">
      <IconSearch />
    </IconButton>
  ),
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.button,
});

describe('IconButton', () => {
  it('shows a tooltip on keyboard focus without changing button clicks', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <IconButton
        aria-label="Search"
        tooltip="Search records"
        onClick={onClick}
        tooltipDelay={0}
      >
        <IconSearch />
      </IconButton>,
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
      <IconButton
        aria-label="Search"
        tooltip="Search is unavailable"
        disabled
        onClick={onClick}
        tooltipDelay={0}
      >
        <IconSearch />
      </IconButton>,
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
