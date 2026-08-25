import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { IconButtonWithTooltip } from '@ui/input/IconButtonWithTooltip/IconButtonWithTooltip';
import { TooltipDelay } from '@ui/surfaces';

const TestIcon = () => <svg />;

describe('IconButtonWithTooltip', () => {
  it('shows the tooltip when the button receives keyboard focus', async () => {
    const user = userEvent.setup();

    render(
      <IconButtonWithTooltip
        Icon={TestIcon}
        ariaLabel="Search"
        tooltipContent="Search"
        tooltipDelay={TooltipDelay.noDelay}
      />,
    );

    await user.tab();

    expect(screen.getByRole('button', { name: 'Search' })).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Search');
  });
});
