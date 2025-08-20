import { type Meta, type StoryObj } from '@storybook/react';
import { IconCheckbox, IconNotes, IconTimelineEvent } from '@ui/display';
import {
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

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
    disabled: false,
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof IconButtonGroup> = {
  argTypes: {
    disabled: { control: false },
  },
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'disabled',
          values: [true, false],
          props: (disabled: boolean) => ({ disabled }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
