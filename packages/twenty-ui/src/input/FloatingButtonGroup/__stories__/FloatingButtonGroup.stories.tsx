import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconCheckbox, IconNotes, IconTimelineEvent } from '@ui/icon';
import {
  A11Y_DEFER_COLOR_CONTRAST,
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
  args: {
    size: 'small',
    children: [
      <FloatingButton key="notes" Icon={IconNotes} ariaLabel="Notes" />,
      <FloatingButton key="checkbox" Icon={IconCheckbox} ariaLabel="Tasks" />,
      <FloatingButton
        key="timeline"
        Icon={IconTimelineEvent}
        ariaLabel="Timeline"
      />,
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
      <FloatingButton key="notes" Icon={IconNotes} ariaLabel="Notes" />,
      <FloatingButton key="checkbox" Icon={IconCheckbox} ariaLabel="Tasks" />,
      <FloatingButton
        key="timeline"
        Icon={IconTimelineEvent}
        ariaLabel="Timeline"
      />,
    ],
  },
  argTypes: {
    size: { control: false },
    children: { control: false },
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
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
