import { type Meta, type StoryObj } from '@storybook/react-vite';

import { Section } from '@ui/components/layout/Section/Section';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { OverflowingList } from '../OverflowingList';
import { OVERFLOWING_LIST_STORY_ITEMS } from './OVERFLOWING_LIST_STORY_ITEMS';
import { OverflowingListControlledExample } from './OverflowingListControlledExample';

const meta: Meta<typeof OverflowingList> = {
  id: 'ui-components-overflowinglist',
  title: 'UI/Components/Layout/OverflowingList',
  component: OverflowingList,
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 260, height: 200 },
    a11y: A11Y_DEFER_COLOR_CONTRAST,
  },
  args: {
    children: OVERFLOWING_LIST_STORY_ITEMS,
    showOverflowCount: true,
    style: { width: 180 },
  },
};

export default meta;
type Story = StoryObj<typeof OverflowingList>;

export const Display: Story = {
  args: { overflowLabel: 'Show all company tags' },
  render: (args) => (
    <Section.Root>
      <Section.Header
        title="Company tags"
        description="Open the count to see all tags."
      />
      <OverflowingList {...args} />
    </Section.Root>
  ),
};

export const Default: Story = {};

export const Controlled: Story = {
  render: () => <OverflowingListControlledExample />,
};

export const InitiallyOpen: Story = {
  args: { defaultOpen: true, maxInlineCount: 1 },
};

export const Empty: Story = {
  args: { children: [] },
};

export const CountOnHoverOrFocus: Story = {
  args: { showOverflowCount: undefined },
};

export const WithoutCount: Story = {
  args: { showOverflowCount: false },
};

export const CappedInlineItems: Story = {
  args: { maxInlineCount: 1 },
};

export const AllItemsFit: Story = {
  args: { style: { width: 360 } },
  parameters: { container: { width: 400, height: 160 } },
};

export const Dark: Story = {
  globals: { colorScheme: 'dark' },
  tags: ['!autodocs'],
};
