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
    title: 'This form will appear in workflow runs.',
    description:
      'Because this workflow is not using a manual trigger, the form will not open on top of the interface. To fill it, open the corresponding workflow run and complete the form there.',
    action: {
      label: 'Learn more',
      onClick: () => {},
    },
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof Callout> = {
  args: {
    title: 'This form will appear in workflow runs.',
    description:
      'Because this workflow is not using a manual trigger, the form will not open on top of the interface. To fill it, open the corresponding workflow run and complete the form there.',
    action: {
      label: 'Learn more',
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
            'success',
            'warning',
            'error',
            'neutral',
            'info',
          ] satisfies CalloutVariant[],
          props: (variant: CalloutVariant) => ({ variant }),
        },
      ],
      options: {
        elementContainer: {
          width: 512,
        },
      },
    },
  },
  decorators: [CatalogDecorator],
};
