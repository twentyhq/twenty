import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { IconBell } from '@ui/icon';
import { LightButton } from '@ui/input/LightButton/LightButton';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { Toast } from '../Toast';
import { type ToastProps } from '../types/ToastProps';
import { type ToastVariant } from '../types/ToastVariant';

const meta: Meta<typeof Toast> = {
  title: 'UI/Feedback/Toast',
  component: Toast,
  args: { children: 'Changes saved', progress: 100 },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Default: Story = {
  decorators: [ComponentDecorator],
  args: { variant: 'success', onClose: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('status')).toHaveTextContent('Changes saved');
    await userEvent.click(canvas.getByRole('button', { name: 'Close' }));
    expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const WithDescriptionAndAction: Story = {
  ...Default,
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    children: 'Record deleted',
    description: 'You can undo this action.',
    variant: 'info',
    onCancel: fn(),
    onClose: fn(),
    cancelLabel: 'Annuler',
    closeLabel: 'Fermer',
  },
  render: (args) => (
    <Toast
      {...args}
      action={<LightButton title="Undo" onClick={args.onCancel} />}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('You can undo this action.')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Undo' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Annuler' }));
    expect(args.onCancel).toHaveBeenCalledTimes(2);
    await userEvent.click(canvas.getByRole('button', { name: 'Fermer' }));
    expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const CustomIconAndLink: Story = {
  ...Default,
  args: { icon: <IconBell size={16} />, onClick: fn() },
  render: (args) => (
    <Toast {...args} action={<a href="#record">View record</a>} />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'View record' });
    expect(link).toHaveAttribute('href', '#record');
    await userEvent.click(canvas.getByText('Changes saved'));
    expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Alert: Story = {
  ...Default,
  args: { role: 'alert', variant: 'error', children: 'Unable to save' },
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).getByRole('alert')).toHaveAttribute(
      'aria-live',
      'assertive',
    );
  },
};

const DismissibleToast = ({ onClose, ...props }: ToastProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Show notification
      </button>
      {isOpen && (
        <Toast
          {...props}
          onClose={() => {
            onClose?.();
            setIsOpen(false);
          }}
        />
      )}
    </>
  );
};

export const Countdown: Story = {
  ...Default,
  args: { progress: undefined, duration: 600, onClose: fn() },
  render: (args) => <DismissibleToast {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('status')).toBeVisible();
    await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce(), {
      timeout: 3000,
    });
    expect(canvas.queryByRole('status')).not.toBeInTheDocument();
  },
};

export const KeyboardDismissal: Story = {
  ...Default,
  render: (args) => <DismissibleToast {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    expect(
      canvas.getByRole('button', { name: 'Show notification' }),
    ).toHaveFocus();
    await userEvent.tab();
    expect(canvas.getByRole('button', { name: 'Close' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(args.onClose).toHaveBeenCalledOnce();
    expect(canvas.queryByRole('status')).not.toBeInTheDocument();
  },
};

export const PauseOnHover: Story = {
  ...Countdown,
  args: {
    ...Countdown.args,
    duration: 1200,
    onMouseEnter: fn(),
    onMouseLeave: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toast = canvas.getByRole('status');
    await userEvent.hover(toast);
    await new Promise((resolve) => setTimeout(resolve, 1400));
    expect(toast).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    expect(args.onMouseEnter).toHaveBeenCalledOnce();
    await userEvent.unhover(toast);
    expect(args.onMouseLeave).toHaveBeenCalledOnce();
    await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce(), {
      timeout: 3000,
    });
  },
};

export const ExplicitProgress: Story = {
  ...Countdown,
  args: { progress: 40, duration: 100, onClose: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(canvas.getByRole('status')).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', { name: 'Close' }));
    expect(args.onClose).toHaveBeenCalledOnce();
  },
};

export const WithoutControls: Story = {
  ...Default,
  args: { onClose: undefined },
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).queryByRole('button')).not.toBeInTheDocument();
  },
};

export const Catalog: CatalogStory<Story, typeof Toast> = {
  decorators: [CatalogDecorator],
  args: { onClose: fn(), progress: 60 },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'content',
          values: ['notification'],
          props: () => ({}),
        },
        {
          name: 'variant',
          values: [
            'default',
            'success',
            'error',
            'info',
            'warning',
          ] satisfies ToastVariant[],
          props: (variant: ToastVariant) => ({ variant }),
        },
      ],
      options: { elementContainer: { style: { width: 310 } } },
    },
  },
};

export const CatalogDark: CatalogStory<Story, typeof Toast> = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
