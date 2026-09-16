import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Tooltip } from '@ui/primitives/surfaces/Tooltip/Tooltip';

import { OverflowingTextWithTooltip } from '../OverflowingTextWithTooltip';

const setTextDimensions = ({
  element,
  clientWidth,
  scrollWidth,
}: {
  element: HTMLElement;
  clientWidth: number;
  scrollWidth: number;
}) => {
  Object.defineProperties(element, {
    clientWidth: { value: clientWidth },
    scrollWidth: { value: scrollWidth },
  });
};

describe('OverflowingTextWithTooltip', () => {
  it('lets a parent tooltip open when the nested text fits', async () => {
    const user = userEvent.setup();

    render(
      <Tooltip content="Field label" delay={0}>
        <div>
          <OverflowingTextWithTooltip text="Short value" tooltipDelay={0} />
        </div>
      </Tooltip>,
    );

    const text = screen.getByText('Short value');

    setTextDimensions({ element: text, clientWidth: 100, scrollWidth: 80 });

    await user.hover(text);

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Field label');
  });

  it('gives the nested tooltip priority when its text is truncated', async () => {
    const user = userEvent.setup();

    render(
      <Tooltip content="Field label" delay={0}>
        <div>
          <OverflowingTextWithTooltip text="Truncated value" tooltipDelay={0} />
        </div>
      </Tooltip>,
    );

    const text = screen.getByText('Truncated value');

    setTextDimensions({ element: text, clientWidth: 80, scrollWidth: 160 });

    await user.hover(text);

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Truncated value',
    );
    expect(screen.getAllByRole('tooltip')).toHaveLength(1);
  });

  it('opens only when the text is truncated without adding a layout wrapper', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <OverflowingTextWithTooltip text="Truncated label" tooltipDelay={0} />,
    );
    const text = screen.getByText('Truncated label');

    setTextDimensions({ element: text, clientWidth: 80, scrollWidth: 160 });

    expect(container.firstElementChild).toBe(text);

    await user.hover(text);

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Truncated label',
    );
  });

  it('keeps text that fits hidden on keyboard focus', async () => {
    const user = userEvent.setup();

    render(<OverflowingTextWithTooltip text="Short label" isFocusable />);

    const text = screen.getByText('Short label');

    setTextDimensions({ element: text, clientWidth: 100, scrollWidth: 80 });

    await user.tab();

    expect(text).toHaveFocus();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('opens on focus and dismisses with Escape while retaining focus', async () => {
    const user = userEvent.setup();

    render(
      <OverflowingTextWithTooltip
        text="Short label"
        tooltipContent="Additional information"
        alwaysShowTooltip
        isFocusable
      />,
    );

    const text = screen.getByText('Short label');

    await user.tab();

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Additional information',
    );

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
    expect(text).toHaveFocus();
  });

  it('keeps the tooltip open while a clicked label retains focus', async () => {
    const user = userEvent.setup();

    render(
      <OverflowingTextWithTooltip
        text="Clickable label"
        alwaysShowTooltip
        isFocusable
        tooltipDelay={0}
      />,
    );

    const text = screen.getByText('Clickable label');

    await user.click(text);

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Clickable label',
    );
    expect(text).toHaveFocus();

    await user.unhover(text);

    expect(screen.getByRole('tooltip')).toBeVisible();

    await user.tab();

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });
});
