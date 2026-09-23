import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { Heading } from '../Heading';

const meta: Meta<typeof Heading> = {
  title: 'UI/Typography/Heading',
  component: Heading,
  args: { children: 'Workspace settings' },
};

export default meta;

type Story = StoryObj<typeof Heading>;

export const Default: Story = {
  decorators: [ComponentDecorator],
};

export const Documentation: Story = {
  ...Default,
};

export const SemanticLevel: Story = {
  decorators: [ComponentDecorator],
  args: { level: 3, size: 'lg' },
  play: async ({ canvasElement }) => {
    const heading = within(canvasElement).getByRole('heading', {
      name: 'Workspace settings',
      level: 3,
    });

    await expect(heading).toHaveAttribute('data-size', 'lg');
    await expect(getComputedStyle(heading).marginBlockEnd).toBe('0px');
  },
};

const HEADING_SIZES = ['xs', 'sm', 'md', 'lg'] as const;
const HEADING_COLORS = ['primary', 'secondary'] as const;

export const Catalog: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <div>
      {HEADING_COLORS.map((color) => (
        <div key={color}>
          {HEADING_SIZES.map((size) => (
            <Heading
              key={size}
              size={size}
              color={color}
              style={{ marginBlockEnd: 'var(--t-spacing-4)' }}
            >
              {size} {color} heading
            </Heading>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const CatalogDark: Story = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
