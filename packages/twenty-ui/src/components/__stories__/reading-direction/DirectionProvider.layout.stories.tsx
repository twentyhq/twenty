import { A11Y_DEFER_COLOR_CONTRAST } from '@ui/testing';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { DirectionalLayoutExample } from './DirectionalLayoutExample';

const meta: Meta<typeof DirectionalLayoutExample> = {
  title: 'UI/Layout/DirectionProvider/Layout',
  component: DirectionalLayoutExample,
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
};

export default meta;
type Story = StoryObj<typeof DirectionalLayoutExample>;

export const LeftToRight: Story = {
  args: { direction: 'ltr' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const isRightToLeft = args.direction === 'rtl';
    const first = canvas.getByRole('button', { name: 'First action' });
    const last = canvas.getByRole('button', { name: 'Last action' });
    expect(
      first.getBoundingClientRect().left > last.getBoundingClientRect().left,
    ).toBe(isRightToLeft);
    expect(getComputedStyle(first).borderStartEndRadius).toBe('0px');
    expect(getComputedStyle(last).borderStartStartRadius).toBe('0px');
    const annual = canvas.getByRole('radio', { name: 'Annual' });
    await userEvent.click(annual);
    await userEvent.keyboard(isRightToLeft ? '{ArrowLeft}' : '{ArrowRight}');
    await waitFor(() =>
      expect(canvas.getByRole('radio', { name: 'Monthly' })).toBeChecked(),
    );
    expect(
      getComputedStyle(
        canvas.getByText('Team plan').closest('button') ??
          canvas.getByText('Team plan'),
      ).textAlign,
    ).toBe('start');
    const titleBox = canvas
      .getByText('Account details')
      .getBoundingClientRect();
    const descriptionBox = canvas
      .getByText('Review the information before continuing.')
      .getBoundingClientRect();
    expect(Math.abs(descriptionBox.left - titleBox.left)).toBeLessThan(1);
    expect(Math.abs(descriptionBox.right - titleBox.right)).toBeLessThan(1);
    const soon = canvas.getByText('Soon');
    const upcoming = canvas.getByRole('button', {
      name: 'Upcoming action Soon',
    });
    expect(upcoming).toBeDisabled();
    expect(
      soon.getBoundingClientRect().left <
        upcoming.getBoundingClientRect().left +
          upcoming.getBoundingClientRect().width / 2,
    ).toBe(isRightToLeft);
    const team = canvas.getByRole('radio', { name: 'Team plan' });
    const personal = canvas.getByRole('radio', { name: 'Personal plan' });
    expect(
      team.getBoundingClientRect().left > personal.getBoundingClientRect().left,
    ).toBe(isRightToLeft);
    await userEvent.click(personal);
    await expect(personal).toBeChecked();
    for (const overlap of ['left', 'right']) {
      const group = canvas.getByTestId(`avatars-${overlap}`).firstElementChild!;
      const groupBox = group.getBoundingClientRect();
      const physicalBoxes = [...group.children]
        .map((child) => child.getBoundingClientRect())
        .sort((firstBox, secondBox) => firstBox.left - secondBox.left);
      for (let index = 1; index < physicalBoxes.length; index++) {
        expect(
          Math.round(
            physicalBoxes[index - 1]!.right - physicalBoxes[index]!.left,
          ),
        ).toBe(3);
      }
      expect(Math.abs(physicalBoxes[0]!.left - groupBox.left)).toBeLessThan(1);
      expect(
        Math.abs(
          Math.max(...physicalBoxes.map((box) => box.right)) - groupBox.right,
        ),
      ).toBeLessThan(1);
    }
    const collapsed = canvas.getAllByRole('button', {
      name: 'Collapse node',
    })[0]!;
    await userEvent.click(collapsed);
    const expanded = canvas.getByRole('button', { name: 'Expand node' });
    await waitFor(() =>
      expect(
        getComputedStyle(expanded.querySelector('svg')!.parentElement!)
          .transform,
      ).toBe(
        isRightToLeft
          ? 'matrix(0, 1, -1, 0, 0, 0)'
          : 'matrix(0, -1, 1, 0, 0, 0)',
      ),
    );
    await userEvent.click(expanded);
    const name = canvas.getByText('name');
    expect(getComputedStyle(name.closest('ul')!).paddingInlineStart).toBe(
      '32px',
    );
    const longLabel = canvas.getByText(
      'A very long account name that must truncate',
    );
    expect(longLabel.scrollWidth).toBeGreaterThan(longLabel.clientWidth);
  },
};

export const RightToLeft: Story = {
  ...LeftToRight,
  args: { direction: 'rtl' },
};
