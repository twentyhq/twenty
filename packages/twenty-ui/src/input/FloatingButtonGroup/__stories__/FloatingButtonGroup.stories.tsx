import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconCheckbox, IconNotes, IconTimelineEvent } from '@ui/icon';
import {
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import {
  FloatingButton,
  type FloatingButtonSize,
} from '@ui/input/FloatingButton/FloatingButton';
import { FloatingButtonGroup } from '@ui/input/FloatingButtonGroup/FloatingButtonGroup';

const meta: Meta<typeof FloatingButtonGroup> = {
  title: 'UI/Input/Button/FloatingButtonGroup',
  component: FloatingButtonGroup,
};

export default meta;
type Story = StoryObj<typeof FloatingButtonGroup>;

export const Default: Story = {
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
  args: {
    size: 'small',
    children: [
      <FloatingButton key="notes" Icon={IconNotes} />,
      <FloatingButton key="checkbox" Icon={IconCheckbox} />,
      <FloatingButton key="timeline" Icon={IconTimelineEvent} />,
    ],
  },
  argTypes: {
    children: { control: false },
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof FloatingButtonGroup> = {
  args: {
    children: [
      <FloatingButton key="notes" Icon={IconNotes} />,
      <FloatingButton key="checkbox" Icon={IconCheckbox} />,
      <FloatingButton key="timeline" Icon={IconTimelineEvent} />,
    ],
  },
  argTypes: {
    size: { control: false },
    children: { control: false },
  },
  parameters: {
    // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
    a11y: { test: 'todo' },
    pseudo: { hover: ['.hover'], active: ['.pressed'], focus: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'sizes',
          values: ['small', 'medium'] satisfies FloatingButtonSize[],
          props: (size: FloatingButtonSize) => ({ size }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
