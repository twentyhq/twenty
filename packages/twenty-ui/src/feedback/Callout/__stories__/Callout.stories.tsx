import { type Meta, type StoryObj } from '@storybook/react-vite';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { Callout } from '@ui/feedback';
import { type CalloutVariant } from '@ui/feedback/Callout/Callout';

const meta: Meta<typeof Callout> = {
  title: 'UI/Feedback/Callout',
  component: Callout,
};

export default meta;
type Story = StoryObj<typeof Callout>;

export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
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
    a11y: A11Y_DEFER_COLOR_CONTRAST,
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
