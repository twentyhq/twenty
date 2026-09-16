import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AppTooltip, TooltipDelay } from '../AppTooltip';

describe('AppTooltip', () => {
  it('closes on pointer leave even when a child retains focus', async () => {
    const user = userEvent.setup();

    render(
      <>
        <div id="row">
          <button>Folder</button>
        </div>
        <AppTooltip
          anchorSelect="#row"
          title="Click to edit"
          delay={TooltipDelay.noDelay}
        />
      </>,
    );

    const button = screen.getByRole('button');
    await user.hover(button);
    expect(await screen.findByRole('tooltip')).toBeVisible();
    await user.click(button);
    expect(button).toHaveFocus();
    await user.unhover(button);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('opens for keyboard focus and closes on blur', async () => {
    const user = userEvent.setup();

    render(
      <>
        <button id="anchor">Folder</button>
        <button>Next</button>
        <AppTooltip
          anchorSelect="#anchor"
          title="Click to edit"
          delay={TooltipDelay.noDelay}
        />
      </>,
    );

    await user.tab();
    expect(await screen.findByRole('tooltip')).toBeVisible();
    await user.tab();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
