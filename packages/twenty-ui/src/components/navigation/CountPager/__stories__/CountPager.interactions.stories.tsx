import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator } from '@ui/testing';
import { themeCssVariables } from '@ui/theme';

import { CountPager } from '../CountPager';
import { CountPagerCollectionExample } from './CountPagerCollectionExample';
import { CountPagerExample } from './CountPagerExample';

const meta: Meta<typeof CountPager> = {
  id: 'ui-components-countpager-interactions',
  title: 'UI/Components/Navigation/CountPager/Interactions',
  component: CountPager,
  decorators: [ComponentDecorator],
  args: {
    'aria-label': 'Review item',
    index: 1,
    count: 3,
    positionText: '2 of 3',
    previousLabel: 'Previous item',
    nextLabel: 'Next item',
    onIndexChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof CountPager>;

export const ControlledRequest: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const previous = canvas.getByRole('button', { name: 'Previous item' });
    const next = canvas.getByRole('button', { name: 'Next item' });

    await userEvent.click(previous);
    await expect(args.onIndexChange).toHaveBeenNthCalledWith(1, 0);
    await userEvent.click(next);
    await expect(args.onIndexChange).toHaveBeenNthCalledWith(2, 2);
    await expect(args.onIndexChange).toHaveBeenCalledTimes(2);
    await expect(
      canvas.getByRole('group', { name: 'Review item' }),
    ).toHaveTextContent('2 of 3');
    await expect(previous).toHaveAttribute('type', 'button');
    await expect(next).toHaveAttribute('type', 'button');
  },
};

export const KeyboardNavigation: Story = {
  render: () => <CountPagerExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const previous = canvas.getByRole('button', { name: 'Previous item' });
    const next = canvas.getByRole('button', { name: 'Next item' });
    const pager = canvas.getByRole('group', { name: 'Review item' });

    await expect(previous).toBeDisabled();
    next.focus();
    await expect(next).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(pager).toHaveTextContent('2 of 3');
    await expect(previous).toBeEnabled();
    await userEvent.keyboard(' ');
    await expect(pager).toHaveTextContent('3 of 3');
    await expect(next).toBeDisabled();
    previous.focus();
    await userEvent.keyboard(' ');
    await expect(pager).toHaveTextContent('2 of 3');
    await userEvent.tab();
    await expect(next).toHaveFocus();
  },
};

export const DisabledStates: Story = {
  render: (args) => (
    <Text style={{ display: 'grid', gap: themeCssVariables.spacing[3] }}>
      <CountPager
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...args}
        aria-label="Empty collection"
        index={0}
        count={0}
        positionText="0 of 0"
      />
      <CountPager
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...args}
        aria-label="Single item"
        index={0}
        count={1}
        positionText="1 of 1"
      />
      <CountPager
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...args}
        aria-label="Disabled collection"
        disabled
      />
      <CountPager
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...args}
        aria-label="Stale selection"
        index={3}
      />
    </Text>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    for (const name of [
      'Empty collection',
      'Single item',
      'Disabled collection',
      'Stale selection',
    ]) {
      const pager = within(canvas.getByRole('group', { name }));

      for (const button of pager.getAllByRole('button')) {
        await expect(button).toBeDisabled();
        await userEvent.click(button);
      }
    }

    await expect(args.onIndexChange).not.toHaveBeenCalled();
  },
};

export const ReplacementSelection: Story = {
  render: ({ onIndexChange }) => (
    <CountPagerCollectionExample onIndexChange={onIndexChange} />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const pager = canvas.getByRole('group', { name: 'Review item' });

    await expect(pager).toHaveTextContent('2 of 3');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Replace collection' }),
    );
    await expect(pager).toHaveTextContent('1 of 1');
    await expect(
      canvas.getByRole('button', { name: 'Previous item' }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole('button', { name: 'Next item' }),
    ).toBeDisabled();
    await expect(args.onIndexChange).not.toHaveBeenCalled();
  },
};

export const LeadingPosition: Story = {
  args: { positionPlacement: 'start', positionText: 'Request 2 of 3' },
  parameters: { container: { width: 320 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const position = canvas.getByText('Request 2 of 3');
    const previous = canvas.getByRole('button', { name: 'Previous item' });
    const next = canvas.getByRole('button', { name: 'Next item' });

    await expect(position.getBoundingClientRect().left).toBeLessThan(
      previous.getBoundingClientRect().left,
    );
    await expect(previous.getBoundingClientRect().left).toBeLessThan(
      next.getBoundingClientRect().left,
    );
  },
};
