import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type CSSProperties } from 'react';
import { expect } from 'storybook/test';

import { Loader } from '@ui/primitives/feedback/Loader/Loader';
import { Text } from '@ui/primitives/typography';
import { ComponentDecorator } from '@ui/testing';

const meta: Meta<typeof Loader> = {
  title: 'UI/Feedback/Loader',
  component: Loader,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof Loader>;

export const WithColor: Story = {
  args: {
    color: 'red',
    role: 'status',
    'aria-label': 'Loading results',
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('status', { name: 'Loading results' }),
    ).toBeVisible();
  },
};

export const WithColorDocumentation: Story = {
  render: () => (
    <Text render={<div />} role="status" style={{ display: 'flex', gap: 8 }}>
      <Loader
        color="blue"
        aria-hidden="true"
        render={<span />}
        data-testid="decorative-loader"
      />
      <Text>Saving changes</Text>
    </Text>
  ),
};

export const WithStatusText: Story = {
  ...WithColorDocumentation,
  play: async ({ canvas }) => {
    const status = canvas.getByRole('status');
    const label = canvas.getByText('Saving changes');
    const loader = canvas.getByTestId('decorative-loader');

    await expect(status).toHaveTextContent('Saving changes');
    await expect(label).toBeVisible();
    await expect(loader).toHaveStyle({ width: '24px', height: '12px' });
    await expect(label.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      loader.getBoundingClientRect().right,
    );
  },
};

export const WithDefaultCssVariable: Story = {
  decorators: [
    (Story) => (
      <Text
        render={<div />}
        style={{ '--tw-button-color': 'blue' } as CSSProperties}
      >
        <Story />
      </Text>
    ),
  ],
  args: { role: 'status', 'aria-label': 'Loading results' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('status', { name: 'Loading results' }),
    ).toHaveStyle({
      borderColor: 'rgb(0, 0, 255)',
    });
  },
};

export const WithDefaultColor: Story = {
  args: { 'aria-hidden': true },
};

export const WithDifferentColors: Story = {
  render: () => (
    <Text render={<div />} style={{ display: 'flex', gap: 16 }}>
      <Loader color="red" aria-hidden="true" />
      <Loader color="blue" aria-hidden="true" />
      <Loader color="yellow" aria-hidden="true" />
      <Loader color="green" aria-hidden="true" />
    </Text>
  ),
};

export const Composition: Story = {
  args: {
    role: 'status',
    'aria-labelledby': 'loader-label',
    render: (props) => <span {...props} />,
    className: 'custom-loader',
    style: { borderColor: '#123456' },
  },
  render: (args) => (
    <Text render={<div />} style={{ display: 'flex', gap: 8 }}>
      <Loader {...args} />
      <Text id="loader-label">Loading results</Text>
    </Text>
  ),
  play: async ({ canvas }) => {
    const loader = canvas.getByRole('status', { name: 'Loading results' });

    await expect(loader.tagName).toBe('SPAN');
    await expect(loader).toHaveClass('custom-loader');
    await expect(loader).toHaveStyle({ borderColor: 'rgb(18, 52, 86)' });
  },
};
