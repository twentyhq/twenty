import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { Text } from '@ui/primitives/typography/Text/Text';

const meta: Meta<typeof Text> = {
  title: 'UI/Typography/Text',
  component: Text,
};

export default meta;

type Story = StoryObj<typeof Text>;

const LONG_TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore';

export const Display: Story = {
  decorators: [ComponentDecorator],
  args: { truncate: true, children: 'Alexandra Montgomery' },
  parameters: { container: { width: 160 } },
};

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

const TEXT_SIZES = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;

export const TypographyCatalog: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <Text style={{ display: 'grid', gap: 'var(--t-spacing-2)' }}>
      {TEXT_SIZES.map((size) => (
        <Text key={size} size={size} color="primary">
          {size} text
        </Text>
      ))}
      <Text size="md" weight="regular" color="primary">
        Regular body text
      </Text>
      <Text size="md" weight="medium" color="secondary">
        Medium secondary text
      </Text>
      <Text size="md" weight="semibold" color="primary">
        Semibold body text
      </Text>
    </Text>
  ),
};

export const Typography: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <Text
      role="group"
      aria-label="Typography examples"
      size="lg"
      weight="medium"
      color="secondary"
      style={{ display: 'grid', gap: 'var(--t-spacing-2)' }}
    >
      <Text>Inherited typography</Text>
      <Text size="xs" weight="semibold" color="primary">
        Caption typography
      </Text>
      <Text color="secondary" style={{ color: 'var(--t-font-color-primary)' }}>
        Runtime color
      </Text>
    </Text>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const parent = canvas.getByRole('group', { name: 'Typography examples' });
    const inherited = canvas.getByText('Inherited typography');
    const caption = canvas.getByText('Caption typography');
    const runtime = canvas.getByText('Runtime color');
    const parentStyle = getComputedStyle(parent);
    const inheritedStyle = getComputedStyle(inherited);
    const captionStyle = getComputedStyle(caption);
    const runtimeStyle = getComputedStyle(runtime);
    const rootFontSize = Number.parseFloat(
      getComputedStyle(canvasElement.ownerDocument.documentElement).fontSize,
    );

    for (const property of [
      'fontSize',
      'fontWeight',
      'color',
      'fontFamily',
      'lineHeight',
    ] as const) {
      await expect(inheritedStyle[property]).toBe(parentStyle[property]);
    }

    await expect(Number.parseFloat(captionStyle.fontSize)).toBeCloseTo(
      rootFontSize * 0.85,
      1,
    );
    await expect(captionStyle.fontWeight).toBe('600');
    await expect(runtimeStyle.color).toBe(
      runtimeStyle.getPropertyValue('--t-font-color-primary').trim(),
    );
  },
};
