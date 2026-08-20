import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { Text } from '@ui/typography/Text/Text';

const meta: Meta<typeof Text> = {
  title: 'UI/Typography/Text',
  component: Text,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof Text>;

const LONG_TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore';

export const Truncate: Story = {
  args: {
    truncate: true,
    children: LONG_TEXT,
  },
  parameters: {
    container: { width: 160 },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const text = await canvas.findByText(LONG_TEXT);
    const { textOverflow, whiteSpace } = getComputedStyle(text);

    await expect(whiteSpace).toBe('nowrap');
    await expect(textOverflow).toBe('ellipsis');
    await expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
  },
};

export const LineClamp: Story = {
  args: {
    lineClamp: 2,
    children: LONG_TEXT,
  },
  parameters: {
    container: { width: 160 },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const text = await canvas.findByText(LONG_TEXT);
    const { overflow, webkitLineClamp } = getComputedStyle(text);

    await expect(webkitLineClamp).toBe('2');
    await expect(overflow).toBe('hidden');
    await expect(text.scrollHeight).toBeGreaterThan(text.clientHeight);
  },
};
