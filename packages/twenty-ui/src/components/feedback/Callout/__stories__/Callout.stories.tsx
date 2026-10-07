import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Callout } from '@ui/components/feedback/Callout/Callout';
import { type CalloutStatus } from '@ui/components/feedback/Callout/types/CalloutStatus';
import { IconAlertTriangle } from '@ui/icon';
import { Button } from '@ui/primitives/input';
import { Text } from '@ui/primitives/typography';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  ComponentDecorator,
  type CatalogStory,
} from '@ui/testing';

const onDismiss = fn();
const onAction = fn();
const onSubmit = fn((event) => event.preventDefault());

const meta: Meta<typeof Callout> = {
  id: 'ui-feedback-callout',
  title: 'UI/Components/Feedback/Callout',
  component: Callout,
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
};

export default meta;
type Story = StoryObj<typeof Callout>;

export const Default: Story = {
  args: {
    status: 'neutral',
    title: 'This form will appear in workflow runs.',
    description:
      'Because this workflow is not using a manual trigger, the form will not open on top of the interface. To fill it, open the corresponding workflow run and complete the form there.',
    action: (
      <Button
        size="sm"
        variant="ghost"
        style={{ fontWeight: 'var(--t-font-weight-regular)' }}
      >
        Learn more
      </Button>
    ),
  },
};

export const FullWidth: Story = {
  args: {
    status: 'error',
    title: 'Your Postcard provider key was revoked.',
    fullWidth: true,
    action: (
      <Button
        size="sm"
        variant="ghost"
        style={{ fontWeight: 'var(--t-font-weight-regular)' }}
      >
        Reconnect
      </Button>
    ),
  },
};

export const DismissalRequest: Story = {
  args: {
    status: 'warning',
    title: <Text render={<span />}>Import needs review</Text>,
    description: (
      <Text render={<span />}>
        Review{' '}
        <Button variant="link" href="#records">
          missing records
        </Button>
        .
      </Text>
    ),
    icon: <IconAlertTriangle size={16} aria-label="Import warning" />,
    action: (
      <Button size="sm" variant="ghost" onClick={onAction}>
        Review import
      </Button>
    ),
    onDismiss,
    closeLabel: 'Dismiss import notice',
  },
  render: (args) => (
    <form onSubmit={onSubmit}>
      <Callout {...args} />
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const close = canvas.getByRole('button', { name: 'Dismiss import notice' });
    await expect(canvas.getByLabelText('Import warning')).toBeVisible();
    await expect(
      canvas.getByRole('link', { name: 'missing records' }),
    ).toHaveAttribute('href', '#records');
    await userEvent.click(close);
    await expect(onDismiss).toHaveBeenCalledTimes(1);
    await expect(onDismiss).toHaveBeenLastCalledWith();
    await userEvent.keyboard('{Enter}');
    await expect(onDismiss).toHaveBeenCalledTimes(2);
    await userEvent.keyboard(' ');
    await expect(onDismiss).toHaveBeenCalledTimes(3);
    await expect(canvas.getByText('Import needs review')).toBeVisible();
    await expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Review import' }),
    );
    await expect(onAction).toHaveBeenCalledTimes(1);
    await expect(onDismiss).toHaveBeenCalledTimes(3);
  },
};

export const CallerVisibility: Story = {
  render: function CallerVisibility() {
    const [isVisible, setIsVisible] = useState(true);
    return (
      <>
        {isVisible && (
          <Callout
            title="Caller-owned notice"
            onDismiss={() => setIsVisible(false)}
          />
        )}
        <Button onClick={() => setIsVisible(true)}>Show notice</Button>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Close' }));
    await expect(
      canvas.queryByText('Caller-owned notice'),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Show notice' }));
    await expect(canvas.getByText('Caller-owned notice')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Close' }));
    await expect(
      canvas.queryByText('Caller-owned notice'),
    ).not.toBeInTheDocument();
  },
};

export const WithoutDismissal: Story = {
  args: {
    title: 'Persistent notice',
    icon: null,
    description: 'Caller-owned content',
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('button'),
    ).not.toBeInTheDocument();
  },
};

export const Catalog: CatalogStory<Story, typeof Callout> = {
  args: Default.args,
  argTypes: { status: { control: false } },
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'status',
          values: [
            'success',
            'warning',
            'error',
            'neutral',
            'info',
          ] satisfies CalloutStatus[],
          props: (status: CalloutStatus) => ({ status }),
        },
      ],
      options: { elementContainer: { width: 512 } },
    },
  },
  decorators: [CatalogDecorator],
};
