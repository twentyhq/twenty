import { type Meta, type StoryObj } from '@storybook/react';
import { IconCheckbox, IconNotes, IconTimelineEvent } from '@ui/display';
import {
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { FloatingButton, type FloatingButtonSize } from '../FloatingButton';
import { FloatingButtonGroup } from '../FloatingButtonGroup';

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
      <FloatingButton Icon={IconNotes} />,
      <FloatingButton Icon={IconCheckbox} />,
      <FloatingButton Icon={IconTimelineEvent} />,
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
      <FloatingButton Icon={IconNotes} />,
      <FloatingButton Icon={IconCheckbox} />,
      <FloatingButton Icon={IconTimelineEvent} />,
    ],
  },
  argTypes: {
    size: { control: false },
    children: { control: false },
  },
  parameters: {
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
