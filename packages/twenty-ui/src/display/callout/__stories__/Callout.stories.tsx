import { type Meta, type StoryObj } from '@storybook/react-vite';
import {
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { Callout } from '@ui/display';
import { type CalloutVariant } from '@ui/display/callout/Callout';

const meta: Meta<typeof Callout> = {
  title: 'UI/Display/Callout',
  component: Callout,
};

export default meta;
type Story = StoryObj<typeof Callout>;

export const Default: Story = {
  args: {
    variant: 'neutral',
    title: 'An callout component',
    description: 'Description of callout component',
    action: {
      label: 'Learn more link',
      onClick: () => {},
    },
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof Callout> = {
  args: {
    title: 'An callout component',
    description: 'Description of callout component',
    action: {
      label: 'Learn more link',
      onClick: () => {},
    },
  },
  argTypes: {
    variant: { control: false },
  },
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'accents',
          values: [
            'warning',
            'neutral',
            'error',
            'info',
            'success',
          ] satisfies CalloutVariant[],
          props: (variant: CalloutVariant) => ({ variant }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
