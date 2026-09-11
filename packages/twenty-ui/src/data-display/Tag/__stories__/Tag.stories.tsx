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
    children: 'Urgent',
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
    children: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
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
    children: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    startIcon: <IconUser />,
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
    children: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
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
      options: { elementContainer: { style: { width: 80 } } },
      dimensions: [
        {
          name: 'variants',
          values: ['soft', 'solid', 'outline', 'ghost'],
          props: (variant: 'soft' | 'solid' | 'outline' | 'ghost') => ({
            variant,
          }),
        },
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
    children: 'No Value',
    variant: 'outline',
    borderStyle: 'dashed',
    weight: 'medium',
  },
  parameters: {
    container: { width: 'auto' },
  },
};

export const CatalogDark: typeof Catalog = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};

export const PointerAndKeyboard: Story = {
  decorators: [ComponentDecorator],
  args: { children: 'Open details', onClick: fn(), color: 'blue' },
  play: async ({ canvasElement, args }) => {
    const control = within(canvasElement).getByRole('button', {
      name: 'Open details',
    });
    await userEvent.click(control);
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(3);
    await expect(control).toHaveFocus();
    await expect(args.onClick).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'click' }),
    );
  },
};

export const Disabled: Story = {
  decorators: [ComponentDecorator],
  args: {
    children: 'Unavailable',
    disabled: true,
    onClick: fn(),
    color: 'blue',
  },
  play: async ({ canvasElement, args }) => {
    const control = within(canvasElement).getByRole('button', {
      name: 'Unavailable',
    });
    await expect(control).toBeDisabled();
    await userEvent.click(control);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
