import { type Meta, type StoryObj } from '@storybook/react';
import { expect, waitFor } from '@storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { Loader } from '../components/Loader';

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
  },
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const element = canvasElement.querySelector(':first-child');

      expect(element).toBeVisible();

      return element;
    });
  },
};

export const WithDefaultCssVariable: Story = {
  decorators: [
    (Story) => (
      // @ts-expect-error: Custom CSS variable for demonstration purposes
      <div style={{ '--tw-button-color': 'blue' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const element = canvasElement.querySelector(':first-child');

      expect(element).toBeVisible();

      return element;
    });
  },
};

export const WithDefaultColor: Story = {
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const element = canvasElement.querySelector(':first-child');

      expect(element).toBeVisible();

      return element;
    });
  },
};

export const WithDifferentColors: Story = {
  render: () => (
    <div id="container" style={{ display: 'flex', gap: '16px' }}>
      <Loader color="red" />
      <Loader color="blue" />
      <Loader color="yellow" />
      <Loader color="green" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const loaders = await waitFor(() => {
      const elements = canvasElement.querySelectorAll('#container > *');

      expect(elements).toHaveLength(4);

      return elements;
    });

    expect(loaders[0]).toHaveStyle({
      borderColor: expect.stringContaining('red'),
    });
    expect(loaders[1]).toHaveStyle({
      borderColor: expect.stringContaining('blue'),
    });
    expect(loaders[2]).toHaveStyle({
      borderColor: expect.stringContaining('yellow'),
    });
    expect(loaders[3]).toHaveStyle({
      borderColor: expect.stringContaining('green'),
    });
  },
};
