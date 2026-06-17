import { type Meta, type StoryObj } from '@storybook/react-vite';
import {
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { type ThemeColor, MAIN_COLOR_NAMES } from '@ui/theme';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Status } from '@ui/data-display/Status/Status';

const meta: Meta<typeof Status> = {
  title: 'UI/Data Display/Status',
  component: Status,
  args: {
    text: 'Urgent',
    weight: 'medium',
  },
};

export default meta;
type Story = StoryObj<typeof Status>;

export const Default: Story = {
  args: {
    color: 'red',
    onClick: fn(),
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const status = canvas.getByRole('heading', { level: 3 });

    await userEvent.click(status);
    expect(args.onClick).toHaveBeenCalled();
  },
};

export const WithLongText: Story = {
  decorators: [ComponentDecorator],
  args: {
    color: 'green',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
  },
  parameters: {
    // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
    a11y: { test: 'todo' },
    container: { width: 100 },
  },
};

export const Catalog: CatalogStory<Story, typeof Status> = {
  argTypes: {
    color: { control: false },
  },
  parameters: {
    // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
    a11y: { test: 'todo' },
    catalog: {
      dimensions: [
        {
          name: 'colors',
          values: MAIN_COLOR_NAMES,
          props: (color: ThemeColor) => ({ color }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
