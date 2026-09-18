import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type FloatingIconButtonSize } from '@ui/components/FloatingIconButton/types/FloatingIconButtonSize';
import { FloatingIconButtonGroup } from '@ui/components/FloatingIconButtonGroup/FloatingIconButtonGroup';
import { IconCheckbox, IconNotes, IconTimelineEvent } from '@ui/icon';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  ComponentDecorator,
  type CatalogStory,
} from '@ui/testing';

const meta: Meta<typeof FloatingIconButtonGroup> = {
  title: 'UI/Input/Button/FloatingIconButtonGroup',
  component: FloatingIconButtonGroup,
  args: {
    iconButtons: [
      { Icon: IconNotes, ariaLabel: 'Notes' },
      { Icon: IconCheckbox, ariaLabel: 'Tasks' },
      { Icon: IconTimelineEvent, ariaLabel: 'Timeline' },
    ],
  },
  argTypes: {
    iconButtons: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof FloatingIconButtonGroup>;

export const Default: Story = {
  args: {
    size: 'small',
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof FloatingIconButtonGroup> = {
  argTypes: {
    size: { control: false },
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: { hover: ['.hover'], active: ['.pressed'], focus: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'sizes',
          values: ['small', 'medium'] satisfies FloatingIconButtonSize[],
          props: (size: FloatingIconButtonSize) => ({ size }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
