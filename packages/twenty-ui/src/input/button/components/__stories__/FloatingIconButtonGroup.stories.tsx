import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconCheckbox, IconNotes, IconTimelineEvent } from '@ui/display';
import {
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { type FloatingIconButtonSize } from '../FloatingIconButton';
import { FloatingIconButtonGroup } from '../FloatingIconButtonGroup';

const meta: Meta<typeof FloatingIconButtonGroup> = {
  title: 'UI/Input/Button/FloatingIconButtonGroup',
  component: FloatingIconButtonGroup,
  args: {
    iconButtons: [
      { Icon: IconNotes },
      { Icon: IconCheckbox },
      { Icon: IconTimelineEvent },
    ],
  },
  argTypes: {
    iconButtons: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof FloatingIconButtonGroup>;

export const Default: Story = {
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
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
    // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
    a11y: { test: 'todo' },
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
