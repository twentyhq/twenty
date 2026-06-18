import { type Meta, type StoryObj } from '@storybook/react-vite';
import { CatalogDecorator, type CatalogStory } from '@ui/testing';

import { ComponentDecorator } from '@ui/testing/decorators/ComponentDecorator';
import { CircularProgressBar } from '@ui/feedback/CircularProgressBar/CircularProgressBar';

const meta: Meta<typeof CircularProgressBar> = {
  title: 'UI/Feedback/CircularProgressBar/CircularProgressBar',
  component: CircularProgressBar,
  args: {
    size: 50,
  },
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};

export default meta;

type Story = StoryObj<typeof CircularProgressBar>;

export const Default: Story = {
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof CircularProgressBar> = {
  argTypes: {},
  parameters: {
    // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
    a11y: { test: 'todo' },
    catalog: {
      dimensions: [
        {
          name: 'barColor',
          values: [undefined, 'red'],
          props: (barColor: string) => ({ barColor }),
          labels: (color: string) => `Segment Color: ${color ?? 'default'}`,
        },
        {
          name: 'barWidth',
          values: [undefined, 5, 10],
          props: (barWidth: number) => ({ barWidth }),
          labels: (width: number) =>
            `Stroke Width: ${width ? width + ' px' : 'default'}`,
        },
        {
          name: 'size',
          values: [undefined, 80, 30],
          props: (size: number) => ({ size }),
          labels: (size: number) => `Size: ${size ? size + ' px' : 'default'}`,
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
