import { type Meta, type StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator, GroupedCatalog } from '@ui/testing';

import { CountPager } from '../CountPager';
import { type CountPagerProps } from '../types/CountPagerProps';
import { CountPagerExample } from './CountPagerExample';

const meta: Meta<typeof CountPager> = {
  id: 'ui-components-countpager',
  title: 'UI/Components/Navigation/CountPager',
  component: CountPager,
  decorators: [ComponentDecorator],
  args: {
    'aria-label': 'Review item',
    index: 0,
    count: 3,
    positionText: '1 of 3',
    previousLabel: 'Previous item',
    nextLabel: 'Next item',
    onIndexChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof CountPager>;

export const Display: Story = {
  argTypes: {
    index: { control: false },
    count: { control: false },
    positionText: { control: false },
    previousLabel: { control: false },
    nextLabel: { control: false },
    'aria-label': { control: false },
  },
  render: ({ disabled, positionPlacement }) => (
    <CountPagerExample
      disabled={disabled}
      positionPlacement={positionPlacement}
    />
  ),
};

const PAGER_EXAMPLES: {
  label: string;
  props: Pick<CountPagerProps, 'index' | 'count' | 'positionText'> &
    Partial<Pick<CountPagerProps, 'disabled' | 'positionPlacement'>>;
}[] = [
  {
    label: 'First item',
    props: { index: 0, count: 3, positionText: '1 of 3' },
  },
  { label: 'Last item', props: { index: 2, count: 3, positionText: '3 of 3' } },
  { label: 'Empty', props: { index: 0, count: 0, positionText: '0 of 0' } },
  {
    label: 'Single item',
    props: { index: 0, count: 1, positionText: '1 of 1' },
  },
  {
    label: 'Disabled',
    props: { index: 1, count: 3, positionText: '2 of 3', disabled: true },
  },
  {
    label: 'Leading position',
    props: {
      index: 1,
      count: 3,
      positionText: 'Request 2 of 3',
      positionPlacement: 'start',
    },
  },
];

export const Catalog: Story = {
  parameters: { container: { width: 540 } },
  render: (args) => (
    <GroupedCatalog
      groups={[{ label: 'Positions and states', examples: PAGER_EXAMPLES }]}
      renderExample={({ label, props }) => (
        <>
          <Text>{label}</Text>
          <CountPager
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...args}
            aria-label={label}
            index={props.index}
            count={props.count}
            positionText={props.positionText}
            disabled={props.disabled}
            positionPlacement={props.positionPlacement}
            style={{ width: 200 }}
          />
        </>
      )}
    />
  ),
};

export const RightToLeft: Story = {
  args: { dir: 'rtl', index: 1, positionText: '2 of 3' },
};
