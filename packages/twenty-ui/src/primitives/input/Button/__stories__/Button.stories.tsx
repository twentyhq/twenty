import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { IconArrowRight, IconPencil, IconPlus, IconX } from '@ui/icon';
import { AnimatedIconCrossfade } from '@ui/primitives/layout/AnimatedIconCrossfade/AnimatedIconCrossfade';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { Button } from '../Button';
import { type ButtonProps } from '../types/ButtonProps';
import { type ButtonVariant } from '../types/ButtonVariant';
import { type ButtonColor } from '../types/ButtonColor';

const meta: Meta<typeof Button> = {
  title: 'UI/Input/Button/Button',
  component: Button,
  args: { children: 'Save changes' },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = { decorators: [ComponentDecorator] };
export const AnimatedIcon: Story = {
  ...Default,
  render: function Render() {
    const [isEditing, setIsEditing] = useState(false);

    return (
      <Button
        size="sm"
        aria-expanded={isEditing}
        onClick={() => setIsEditing(!isEditing)}
        startIcon={
          <AnimatedIconCrossfade
            isActive={isEditing}
            ActiveIcon={IconX}
            InactiveIcon={IconPencil}
          />
        }
      >
        Edit actions
      </Button>
    );
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Edit actions',
    });
    await document.fonts.load('500 1em Inter');
    await document.fonts.ready;
    const svgIcons = button.querySelectorAll('svg');
    const pencil = svgIcons[0]!;
    const cross = svgIcons[1]!;
    const originalWidth = button.getBoundingClientRect().width;

    await expect(button.getBoundingClientRect().height).toBe(24);
    await expect(pencil.getBoundingClientRect().width).toBe(14);
    button.focus();
    await userEvent.keyboard('{Enter}');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => {
      expect(getComputedStyle(pencil.parentElement!).opacity).toBe('0');
      expect(getComputedStyle(cross.parentElement!).opacity).toBe('1');
    });
    await waitFor(() =>
      expect(button.getBoundingClientRect().width).toBe(originalWidth),
    );
    await userEvent.keyboard(' ');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await userEvent.tab();
  },
};
export const AnimatedIconDocumentation: Story = {
  ...AnimatedIcon,
  play: undefined,
};
export const Keyboard: Story = {
  ...Default,
  args: { onClick: fn(), onFocus: fn(), onBlur: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');
    button.focus();
    await expect(args.onFocus).toHaveBeenCalledOnce();
    await userEvent.keyboard('{Enter} ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await userEvent.tab();
    await expect(args.onBlur).toHaveBeenCalledOnce();
  },
};
export const Disabled: Story = {
  ...Default,
  args: { disabled: true, onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
export const Soon: Story = {
  ...Disabled,
  args: { soon: true, soonLabel: 'Coming soon', onClick: fn() },
};

const LoadingExample = () => {
  const [loading, setLoading] = useState(false);
  return (
    <>
      <Button
        startIcon={<IconPlus />}
        loading={loading}
        onClick={() => setLoading(true)}
      >
        Create record
      </Button>
      <Button onClick={() => setLoading(false)}>Complete request</Button>
    </>
  );
};
export const Loading: Story = {
  ...Default,
  render: () => <LoadingExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Create record' });
    const width = button.getBoundingClientRect().width;
    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toBeDisabled();
    await expect(button.getBoundingClientRect().width).toBe(width);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Complete request' }),
    );
    await expect(button).toBeEnabled();
  },
};
export const NativeForm: Story = {
  ...Default,
  args: { onClick: fn() },
  render: (args) => (
    <form aria-label="Profile" onSubmit={(event) => event.preventDefault()}>
      <input aria-label="Name" defaultValue="Ada" />
      <Button {...args}>Default button</Button>
      <Button type="reset">Reset</Button>
      <Button type="submit">Submit</Button>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole('form');
    const onSubmit = fn();
    form.addEventListener('submit', onSubmit);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Default button' }),
    );
    await expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
    await expect(onSubmit).toHaveBeenCalledOnce();
    const input = canvas.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'Grace');
    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await expect(input).toHaveValue('Ada');
    form.removeEventListener('submit', onSubmit);
  },
};
export const LinkButton: Story = {
  ...Default,
  args: {
    href: '#button-destination',
    target: '_blank',
    rel: 'noreferrer',
    children: 'Read documentation',
  },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link');
    await expect(link).toHaveAttribute('href', '#button-destination');
    await expect(link).not.toHaveAttribute('type');
  },
};
export const DisabledLink: Story = {
  ...Default,
  args: { href: '#disabled-destination', disabled: true, onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const link = within(canvasElement).getByRole('link');
    await expect(link).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(link);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
export const CustomRender: Story = {
  ...Keyboard,
  args: {
    render: <button data-custom-render />,
    onClick: fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
};
export const Icons: Story = {
  ...Default,
  args: {
    startIcon: <IconPlus />,
    endIcon: <IconArrowRight />,
    hotkeys: ['⌘', '⏎'],
  },
};
export const Truncation: Story = {
  ...Default,
  args: {
    children: 'A long button label that must remain inside its container',
    startIcon: <IconPlus />,
    endIcon: <IconArrowRight />,
    style: { width: 220 },
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button');
    await expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth);
  },
};

const CATALOG_STATES: Record<string, Partial<ButtonProps>> = {
  default: {},
  small: { size: 'sm' },
  disabled: { disabled: true },
  loading: { loading: true },
};
export const Catalog: CatalogStory<Story, typeof Button> = {
  decorators: [CatalogDecorator],
  args: { children: 'Button' },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'state',
          values: Object.keys(CATALOG_STATES),
          props: (state: string) => CATALOG_STATES[state] ?? {},
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
      options: { elementContainer: { style: { width: 100 } } },
    },
  },
};
export const CatalogDark: CatalogStory<Story, typeof Button> = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
