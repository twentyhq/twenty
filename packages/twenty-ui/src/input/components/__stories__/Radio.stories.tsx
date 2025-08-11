import { type Meta, type StoryObj } from '@storybook/react';
import {
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { LabelPosition, Radio, RadioSize } from '../Radio';

const meta: Meta<typeof Radio> = {
  title: 'UI/Input/Radio/Radio',
  component: Radio,
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Default: Story = {
  args: {
    label: 'Radio',
    checked: false,
    disabled: false,
    size: RadioSize.Small,
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof Radio> = {
  args: {
    label: 'Radio',
  },
  argTypes: {
    size: { control: false },
  },
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'checked',
          values: [false, true],
          props: (checked: boolean) => ({ checked }),
        },
        {
          name: 'disabled',
          values: [false, true],
          props: (disabled: boolean) => ({ disabled }),
        },
        {
          name: 'size',
          values: Object.values(RadioSize),
          props: (size: RadioSize) => ({ size }),
        },
        {
          name: 'labelPosition',
          values: Object.values(LabelPosition),
          props: (labelPosition: LabelPosition) => ({
            labelPosition,
          }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
