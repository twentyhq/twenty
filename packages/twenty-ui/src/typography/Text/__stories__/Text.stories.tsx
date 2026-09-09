import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { Text } from '@ui/typography/Text/Text';

const meta: Meta<typeof Text> = {
  title: 'UI/Typography/Text',
  component: Text,
};

export default meta;

type Story = StoryObj<typeof Text>;

const LONG_TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore';

export const Truncate: Story = {
  decorators: [ComponentDecorator],
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
  decorators: [ComponentDecorator],
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

type TextCatalogOverflow = 'wrap' | 'truncate' | 'lineClamp';

const getTextCatalogOverflowProps = (overflow: TextCatalogOverflow) => {
  if (overflow === 'truncate') {
    return { truncate: true };
  }

  if (overflow === 'lineClamp') {
    return { lineClamp: 2 };
  }

  return {};
};

export const Catalog: CatalogStory<Story, typeof Text> = {
  args: { children: LONG_TEXT },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'overflow',
          values: [
            'wrap',
            'truncate',
            'lineClamp',
          ] satisfies TextCatalogOverflow[],
          props: getTextCatalogOverflowProps,
        },
      ],
      options: {
        elementContainer: { style: { width: 120 } },
      },
    },
  },
  decorators: [CatalogDecorator],
};

export const CatalogDark: CatalogStory<Story, typeof Text> = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
