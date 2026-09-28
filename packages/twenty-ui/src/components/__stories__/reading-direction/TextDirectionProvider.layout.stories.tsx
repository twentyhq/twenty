import { A11Y_DEFER_COLOR_CONTRAST } from '@ui/testing';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { DirectionalLayoutExample } from './DirectionalLayoutExample';

const meta: Meta<typeof DirectionalLayoutExample> = {
  title: 'UI/Layout/TextDirectionProvider/Layout',
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
    const description = canvas.getByText(
      'Review the information before continuing.',
    ).parentElement!;
    expect(getComputedStyle(description).paddingInlineStart).toBe('24px');
    expect(getComputedStyle(description).paddingInlineEnd).toBe('0px');
    const soon = canvas.getByText('Soon');
    const upcoming = canvas.getByRole('button', { name: /Upcoming action/ });
    expect(
      soon.getBoundingClientRect().left <
        upcoming.getBoundingClientRect().left +
          upcoming.getBoundingClientRect().width / 2,
    ).toBe(isRightToLeft);
    const light = canvas.getByRole('button', { name: 'Light' });
    const dark = canvas.getByRole('button', { name: 'Dark' });
    expect(
      light.getBoundingClientRect().left > dark.getBoundingClientRect().left,
    ).toBe(isRightToLeft);
    expect(
      Math.abs(
        light.getBoundingClientRect().left - dark.getBoundingClientRect().left,
      ),
    ).toBeGreaterThan(light.getBoundingClientRect().width);
    await userEvent.click(dark);
    for (const overlap of ['left', 'right']) {
      const group = canvas.getByTestId(`avatars-${overlap}`).firstElementChild!;
      const boxes = [...group.children].map((child) =>
        child.getBoundingClientRect(),
      );
      const physicalBoxes = boxes.sort(
        (firstBox, secondBox) => firstBox.left - secondBox.left,
      );
      for (let index = 1; index < physicalBoxes.length; index++) {
        expect(
          Math.round(
            physicalBoxes[index - 1]!.right - physicalBoxes[index]!.left,
          ),
        ).toBe(3);
      }
      expect(
        Math.round(physicalBoxes[0]!.left - group.getBoundingClientRect().left),
      ).toBeGreaterThanOrEqual(0);
    }
    const collapsed = canvas.getAllByRole('button', {
      name: 'Collapse node',
    })[0]!;
    await userEvent.click(collapsed);
    const expanded = canvas.getByRole('button', { name: 'Expand node' });
    await waitFor(() =>
      expect(getComputedStyle(expanded.lastElementChild!).transform).toBe(
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
