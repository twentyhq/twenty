import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type FormEventHandler } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { type ButtonProps } from '@ui/primitives/input/Button/types/ButtonProps';
import { type ButtonVariant } from '@ui/primitives/input/Button/types/ButtonVariant';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { MainButton } from '../MainButton';

type MainButtonStoryProps = ButtonProps & {
  onFormSubmit?: FormEventHandler<HTMLFormElement>;
};

const meta: Meta<MainButtonStoryProps> = {
  title: 'UI/Components/MainButton',
  component: MainButton,
  args: { children: 'Save changes' },
};

export default meta;
type Story = StoryObj<MainButtonStoryProps>;

export const Default: Story = { decorators: [ComponentDecorator] };

export const FormControls: Story = {
  ...Default,
  args: {
    onClick: fn(),
    onFormSubmit: fn<FormEventHandler<HTMLFormElement>>((event) =>
      event.preventDefault(),
    ),
  },
  render: (args) => (
    <form onSubmit={args.onFormSubmit}>
      <MainButton onClick={args.onClick}>Preview changes</MainButton>
      <MainButton type="submit" onClick={args.onClick}>
        Save changes
      </MainButton>
    </form>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const previewButton = canvas.getByRole('button', {
      name: 'Preview changes',
    });
    const previewButtonStyle = getComputedStyle(previewButton);

    await expect(previewButtonStyle.fontWeight).toBe('600');
    await expect(previewButtonStyle.paddingInlineStart).toBe('12px');
    await expect(previewButtonStyle.paddingInlineEnd).toBe('12px');
    await expect(previewButtonStyle.boxShadow).not.toBe('none');
    await expect(previewButton).toHaveAttribute('type', 'button');
    await userEvent.click(previewButton);
    await expect(args.onClick).toHaveBeenCalledOnce();
    await expect(args.onFormSubmit).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }));
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await expect(args.onFormSubmit).toHaveBeenCalledOnce();
  },
};

export const Loading: Story = {
  ...Default,
  args: {
    loading: true,
    className: ({ disabled }) => (disabled ? 'unavailable-action' : undefined),
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Save changes',
    });

    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toHaveClass('unavailable-action');
    await expect(getComputedStyle(button).fontWeight).toBe('600');
  },
};

export const DisabledOutline: Story = {
  ...Default,
  args: { variant: 'outline', elevated: false, disabled: true, onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');

    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('data-variant', 'outline');
    await expect(getComputedStyle(button).boxShadow).toBe('none');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

const CATALOG_STATES: Record<string, Partial<ButtonProps>> = {
  default: {},
  small: { size: 'sm' },
  disabled: { disabled: true },
  loading: { loading: true },
};

export const Catalog: CatalogStory<Story, typeof MainButton> = {
  decorators: [CatalogDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'state',
          values: Object.keys(CATALOG_STATES),
          props: (state: string) => CATALOG_STATES[state],
        },
        {
          name: 'variant',
          values: ['solid', 'outline'],
          props: (variant: ButtonVariant) => ({ variant }),
        },
      ],
      options: { elementContainer: { style: { width: 100 } } },
    },
  },
};

export const CatalogDark: CatalogStory<Story, typeof MainButton> = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
