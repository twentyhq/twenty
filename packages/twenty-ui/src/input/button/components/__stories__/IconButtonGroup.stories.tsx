import { Meta, StoryObj } from '@storybook/react';
import { IconCheckbox, IconNotes, IconTimelineEvent } from '@ui/display';
import {
  CatalogDecorator,
  CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import {
  IconButtonAccent,
  IconButtonSize,
  IconButtonVariant,
} from '../IconButton';
import { IconButtonGroup } from '../IconButtonGroup';

const meta: Meta<typeof IconButtonGroup> = {
  title: 'UI/Input/Button/IconButtonGroup',
  component: IconButtonGroup,
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
type Story = StoryObj<typeof IconButtonGroup>;

export const Default: Story = {
  args: {
    size: 'small',
    variant: 'primary',
    accent: 'danger',
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof IconButtonGroup> = {
  argTypes: {
    size: { control: false },
    variant: { control: false },
    accent: { control: false },
  },
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'sizes',
          values: ['small', 'medium'] satisfies IconButtonSize[],
          props: (size: IconButtonSize) => ({ size }),
        },
        {
          name: 'accents',
          values: ['default', 'blue', 'danger'] satisfies IconButtonAccent[],
          props: (accent: IconButtonAccent) => ({ accent }),
        },
        {
          name: 'variants',
          values: [
            'primary',
            'secondary',
            'tertiary',
          ] satisfies IconButtonVariant[],
          props: (variant: IconButtonVariant) => ({ variant }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
