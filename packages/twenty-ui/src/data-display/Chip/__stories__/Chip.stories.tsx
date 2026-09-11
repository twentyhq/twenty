import { expect, fn, userEvent, within } from 'storybook/test';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconUser, IconX } from '@ui/icon';
import { Avatar } from '@ui/data-display/Avatar/Avatar';

import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { Chip } from '@ui/data-display/Chip/Chip';
import { type ChipSize } from '@ui/data-display/Chip/types/ChipSize';
import { type ChipVariant } from '@ui/data-display/Chip/types/ChipVariant';

const meta: Meta<typeof Chip> = {
  title: 'UI/Data Display/Chip',
  component: Chip,
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Default: Story = {
  args: {
    children: 'Chip test',
    size: 'sm',
    variant: 'soft',
    color: 'primary',
    disabled: false,
    clickable: true,
    maxWidth: 200,
  },
  decorators: [ComponentDecorator],
};

export const WithLeftAvatar: Story = {
  args: {
    children: 'John Doe',
    clickable: true,
    variant: 'ghost',
    startElement: (
      <Avatar name="JD" colorSeed="John Doe" size="sm" shape="circle" />
    ),
  },
  decorators: [ComponentDecorator],
};

export const WithLeftIcon: Story = {
  args: {
    children: 'Company',
    clickable: true,
    variant: 'ghost',
    startElement: <IconUser size={14} />,
  },
  decorators: [ComponentDecorator],
};

export const EmptyLabel: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    children: '',
    clickable: true,
    variant: 'ghost',
    startElement: <Avatar name="?" colorSeed="empty" size="sm" />,
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof Chip> = {
  args: { clickable: true, children: 'Hello' },
  argTypes: {
    size: { control: false },
    variant: { control: false },
    color: { control: false },
    disabled: { control: false },
    className: { control: false },
    endElement: { control: false },
    startElement: { control: false },
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: { hover: ['.hover'], active: ['.active'] },
    catalog: {
      options: { elementContainer: { style: { width: 110 } } },
      dimensions: [
        {
          name: 'variants',
          values: ['ghost', 'soft', 'solid'],
          props: (variant: ChipVariant) => ({ variant }),
        },
        {
          name: 'sizes',
          values: ['sm', 'md'],
          props: (size: ChipSize) => ({ size }),
        },
        {
          name: 'states',
          values: ['default', 'hover', 'active', 'disabled'],
          props: (state: string) => {
            switch (state) {
              case 'hover':
              case 'active':
                return { className: state };
              case 'disabled':
                return { disabled: true };
              default:
                return {};
            }
          },
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};

export const WithAvatarCatalog: CatalogStory<Story, typeof Chip> = {
  args: {
    clickable: true,
    children: 'John Doe',
    startElement: (
      <Avatar name="JD" colorSeed="John Doe" size="sm" shape="circle" />
    ),
  },
  argTypes: {
    size: { control: false },
    variant: { control: false },
    color: { control: false },
    disabled: { control: false },
    className: { control: false },
    endElement: { control: false },
    startElement: { control: false },
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: { hover: ['.hover'], active: ['.active'] },
    catalog: {
      options: { elementContainer: { style: { width: 110 } } },
      dimensions: [
        {
          name: 'variants',
          values: ['ghost', 'soft', 'solid'],
          props: (variant: ChipVariant) => ({ variant }),
        },
        {
          name: 'sizes',
          values: ['sm', 'md'],
          props: (size: ChipSize) => ({ size }),
        },
        {
          name: 'states',
          values: ['default', 'hover', 'active', 'disabled'],
          props: (state: string) => {
            switch (state) {
              case 'hover':
              case 'active':
                return { className: state };
              case 'disabled':
                return { disabled: true };
              default:
                return {};
            }
          },
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};

export const WithRightComponentDivider: Story = {
  args: {
    children: 'document.pdf',
    variant: 'soft',
    clickable: false,
    startElement: (
      <Avatar name="D" colorSeed="document" size="sm" shape="square" />
    ),
    endElement: <IconX size={14} />,
    endElementDivider: true,
  },
  decorators: [ComponentDecorator],
};

export const CatalogDark: typeof Catalog = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};

export const PointerAndKeyboard: Story = {
  decorators: [ComponentDecorator],
  args: { children: 'Open details', onClick: fn() },
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
  args: { children: 'Unavailable', disabled: true, onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const control = within(canvasElement).getByRole('button', {
      name: 'Unavailable',
    });
    await expect(control).toBeDisabled();
    await userEvent.click(control);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const ContentAndSlots: Story = {
  decorators: [ComponentDecorator],
  args: {
    children: <strong>Rich content</strong>,
    clickable: false,
    startElement: <IconUser />,
    endElement: (
      <button type="button" onClick={fn()}>
        Remove
      </button>
    ),
    endElementDivider: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Rich content')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Remove' }));
  },
};
