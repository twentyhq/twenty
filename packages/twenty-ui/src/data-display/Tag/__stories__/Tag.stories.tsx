import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { IconUser } from '@ui/icon/components/TablerIcons';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { type ThemeColor, MAIN_COLOR_NAMES } from '@ui/theme';

import { Tag } from '@ui/data-display/Tag/Tag';

const meta: Meta<typeof Tag> = {
  title: 'UI/Data Display/Tag',
  component: Tag,
  args: {
    text: 'Urgent',
  },
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Default: Story = {
  args: {
    color: 'red',
    onClick: fn(),
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const tag = canvas.getByText('Urgent');

    await userEvent.click(tag);
    await expect(args.onClick).toHaveBeenCalled();
  },
};

export const WithLongText: Story = {
  decorators: [ComponentDecorator],
  args: {
    color: 'green',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    container: { width: 100 },
  },
};

export const WithIcon: Story = {
  decorators: [ComponentDecorator],
  args: {
    color: 'green',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    Icon: IconUser,
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    container: { width: 100 },
  },
};

export const DontShrink: Story = {
  decorators: [ComponentDecorator],
  args: {
    color: 'green',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    preventShrink: true,
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    container: { width: 100 },
  },
};

export const Catalog: CatalogStory<Story, typeof Tag> = {
  argTypes: {
    color: { control: false },
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
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

export const EmptyTag: Story = {
  decorators: [ComponentDecorator],
  args: {
    color: 'transparent',
    text: 'No Value',
    variant: 'outline',
    weight: 'medium',
  },
  parameters: {
    container: { width: 'auto' },
  },
};
