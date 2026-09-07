import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { IconInfoCircle } from '@ui/icon';

import { AppTooltip, type AppTooltipProps, TooltipDelay } from '../AppTooltip';

const renderTooltip = (props: AppTooltipProps) =>
  render(
    <>
      <button type="button" id="tooltip-anchor">
        Amount
      </button>
      <AppTooltip anchorSelect="#tooltip-anchor" isOpen {...props} />
    </>,
  );

describe('AppTooltip', () => {
  it.each([
    { maxWidth: undefined, expectedMaxWidth: '300px' },
    { maxWidth: '200px', expectedMaxWidth: '200px' },
  ])(
    'limits width to $expectedMaxWidth',
    async ({ maxWidth, expectedMaxWidth }) => {
      renderTooltip({ title: 'Amount', maxWidth });

      const tooltip = await screen.findByRole('tooltip');

      expect(tooltip.parentElement).toHaveStyle({ maxWidth: expectedMaxWidth });
    },
  );

  it('does not show an arrow by default', async () => {
    renderTooltip({ title: 'Amount' });

    const tooltip = await screen.findByRole('tooltip');

    expect(tooltip.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('allows opting into a decorative arrow', async () => {
    renderTooltip({ title: 'Amount', noArrow: false });

    const tooltip = await screen.findByRole('tooltip');

    expect(tooltip.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('renders a title and description', async () => {
    renderTooltip({ title: 'Amount', description: 'Expected revenue' });

    const tooltip = await screen.findByRole('tooltip');

    expect(within(tooltip).getByText('Amount')).toBeInTheDocument();
    expect(within(tooltip).getByText('Expected revenue')).toBeInTheDocument();
  });

  it('renders a description without a title', async () => {
    renderTooltip({ description: 'Expected revenue' });

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      /^Expected revenue$/,
    );
  });

  it('keeps the leading icon decorative', async () => {
    renderTooltip({ title: 'Amount', Icon: IconInfoCircle });

    const tooltip = await screen.findByRole('tooltip');

    expect(tooltip.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(tooltip).toHaveTextContent(/^Amount$/);
  });

  it('renders a title without a description', async () => {
    renderTooltip({ title: 'Amount' });

    expect(await screen.findByRole('tooltip')).toHaveTextContent(/^Amount$/);
  });

  it('preserves custom JSX content', async () => {
    renderTooltip({ children: <strong>Custom content</strong> });

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Custom content',
    );
  });

  it('keeps interactive custom content usable while hovered', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    renderTooltip({
      children: (
        <button type="button" onClick={onClick}>
          Show more
        </button>
      ),
      interactive: true,
      isOpen: undefined,
      delay: TooltipDelay.noDelay,
    });

    await user.hover(screen.getByRole('button', { name: 'Amount' }));

    const tooltip = await screen.findByRole('tooltip');
    await user.hover(tooltip);
    await user.click(
      within(tooltip).getByRole('button', { name: 'Show more' }),
    );

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(tooltip).toBeInTheDocument();

    await user.unhover(tooltip);

    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
  });

  it('does not show an empty tooltip or an icon alone', () => {
    renderTooltip({ title: '', description: '', Icon: IconInfoCircle });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('does not show a hidden tooltip', () => {
    renderTooltip({ title: 'Amount', hidden: true });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('opens on keyboard focus and closes on blur', async () => {
    const user = userEvent.setup();
    renderTooltip({
      title: 'Amount',
      description: 'Expected revenue',
      isOpen: undefined,
      delay: TooltipDelay.noDelay,
    });

    await user.tab();

    expect(screen.getByRole('button')).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Expected revenue',
    );

    await user.tab();

    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
  });

  it('waits for the hover delay before opening', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    try {
      renderTooltip({
        title: 'Amount',
        description: 'Expected revenue',
        isOpen: undefined,
        delay: TooltipDelay.longDelay,
      });

      await user.hover(screen.getByRole('button'));
      await act(async () => jest.advanceTimersByTime(999));
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      await act(async () => jest.advanceTimersByTime(1));
      expect(screen.getByRole('tooltip')).toHaveTextContent('Expected revenue');
    } finally {
      jest.useRealTimers();
    }
  });
});
