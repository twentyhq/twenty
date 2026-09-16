import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  it('stays open on pointer leave while the anchor itself holds focus', async () => {
    const user = userEvent.setup();

    render(
      <>
        <span id="anchor" tabIndex={0}>
          Domain Name
        </span>
        <AppTooltip
          anchorSelect="#anchor"
          title="The company website URL"
          delay={TooltipDelay.noDelay}
        />
      </>,
    );

    await user.tab();
    const anchor = screen.getByText('Domain Name');
    expect(anchor).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toBeVisible();

    await user.hover(anchor);
    await user.unhover(anchor);

    expect(anchor).toHaveFocus();
    expect(screen.getByRole('tooltip')).toBeVisible();
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
  it('does not restore a stale tooltip after a menu closes', async () => {
    const user = userEvent.setup();
    const renderTooltip = (hidden: boolean) => (
      <>
        <button id="anchor">Folder</button>
        <AppTooltip
          anchorSelect="#anchor"
          title="Folder tooltip"
          hidden={hidden}
          delay={TooltipDelay.noDelay}
        />
      </>
    );
    const { rerender } = render(renderTooltip(false));

    await user.hover(screen.getByRole('button'));
    expect(await screen.findByRole('tooltip')).toBeVisible();
    rerender(renderTooltip(true));
    await user.unhover(screen.getByRole('button'));
    rerender(renderTooltip(false));

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    await user.hover(screen.getByRole('button'));
    expect(await screen.findByRole('tooltip')).toBeVisible();
  });

  it('closes when a hovered anchor is replaced without a leave event', async () => {
    const user = userEvent.setup();
    const renderTooltip = (version: number) => (
      <>
        <button key={version} id="anchor">
          Folder
        </button>
        <AppTooltip
          anchorSelect="#anchor"
          title="Folder tooltip"
          delay={TooltipDelay.noDelay}
        />
      </>
    );
    const { rerender } = render(renderTooltip(0));

    await user.hover(screen.getByRole('button'));
    expect(await screen.findByRole('tooltip')).toBeVisible();
    rerender(renderTooltip(1));

    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
  });
  it('closes on pointer movement outside even if mouseleave was missed', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button id="anchor">Folder</button>
        <AppTooltip
          anchorSelect="#anchor"
          title="Folder tooltip"
          delay={TooltipDelay.noDelay}
        />
      </>,
    );

    await user.hover(screen.getByRole('button'));
    expect(await screen.findByRole('tooltip')).toBeVisible();
    fireEvent.pointerMove(document.body);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
