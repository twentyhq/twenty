import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { IconPlus, IconSearch } from '@ui/icon';
import { TooltipDelay } from '@ui/primitives/surfaces/AppTooltip/AppTooltip';
import { ButtonGroup } from '@ui/primitives/input/ButtonGroup/ButtonGroup';
import { type ButtonColor } from '@ui/primitives/input/Button/types/ButtonColor';
import { type ButtonVariant } from '@ui/primitives/input/Button/types/ButtonVariant';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { IconButton } from '../IconButton';
import { type IconButtonProps } from '../types/IconButtonProps';

const meta: Meta<typeof IconButton> = {
  title: 'UI/Components/IconButton',
  component: IconButton,
  args: { children: <IconSearch />, 'aria-label': 'Search' },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = { decorators: [ComponentDecorator] };

export const Keyboard: Story = {
  ...Default,
  args: { onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Search',
    });

    button.focus();
    await userEvent.keyboard('{Enter} ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const Disabled: Story = {
  ...Default,
  args: { disabled: true, onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Search',
    });

    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Loading: Story = {
  ...Disabled,
  args: { loading: true, onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Search',
    });

    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toBeDisabled();
    await expect(button.getBoundingClientRect().width).toBe(
      button.getBoundingClientRect().height,
    );
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Link: Story = {
  ...Default,
  args: { href: '#search', onClick: fn((event) => event.preventDefault()) },
  play: async ({ canvasElement, args }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Search' });

    await expect(link).toHaveAttribute('href', '#search');
    link.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Tooltip: Story = {
  ...Default,
  args: { tooltip: 'Search records', tooltipDelay: TooltipDelay.noDelay },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Search',
    });

    button.focus();
    await expect(button).toHaveFocus();
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent('Search records');
  },
};

export const TooltipDisabled: Story = {
  ...Tooltip,
  args: { ...Tooltip.args, disabled: true, onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Search',
    });

    await expect(button).toBeDisabled();
    await userEvent.hover(button);
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent('Search records');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const TooltipLoading: Story = {
  ...TooltipDisabled,
  args: { ...Tooltip.args, loading: true, onClick: fn() },
};

export const TooltipLink: Story = {
  ...Tooltip,
  args: {
    ...Tooltip.args,
    href: '#search',
    render: (props) => (
      <a {...props} data-custom-render>
        {props.children}
      </a>
    ),
  },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Search' });

    await expect(link).toHaveAttribute('href', '#search');
    await expect(link).toHaveAttribute('data-custom-render');
    await expect(link).not.toHaveAttribute('type');
    link.focus();
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent('Search records');
  },
};

export const Grouped: Story = {
  ...Default,
  render: () => (
    <ButtonGroup
      aria-label="Record actions"
      size="sm"
      variant="solid"
      color="accent"
    >
      <IconButton aria-label="Search">
        <IconSearch />
      </IconButton>
      <IconButton aria-label="Create" tooltip="Create record">
        <IconPlus />
      </IconButton>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const buttons = within(canvasElement).getAllByRole('button');

    for (const button of buttons) {
      await expect(button).toHaveAttribute('data-variant', 'solid');
      await expect(button.getBoundingClientRect().width).toBe(24);
      await expect(button.getBoundingClientRect().height).toBe(24);
    }
  },
};

const CATALOG_STATES: Record<string, Partial<IconButtonProps>> = {
  default: {},
  small: { size: 'sm' },
  hover: { className: 'hover' },
  pressed: { className: 'pressed' },
  focused: { className: 'focused' },
  disabled: { disabled: true },
  loading: { loading: true },
};

export const Catalog: CatalogStory<Story, typeof IconButton> = {
  decorators: [CatalogDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: {
      hover: ['.hover'],
      active: ['.pressed'],
      focusVisible: ['.focused'],
    },
    catalog: {
      dimensions: [
        {
          name: 'state',
          values: Object.keys(CATALOG_STATES),
          props: (state: string) => CATALOG_STATES[state],
        },
        {
          name: 'color',
          values: ['neutral', 'accent', 'danger', 'success'],
          props: (color: ButtonColor) => ({ color }),
        },
        {
          name: 'variant',
          values: ['solid', 'outline', 'soft', 'ghost'],
          props: (variant: ButtonVariant) => ({ variant }),
        },
      ],
    },
  },
};

export const CatalogDark: CatalogStory<Story, typeof IconButton> = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
