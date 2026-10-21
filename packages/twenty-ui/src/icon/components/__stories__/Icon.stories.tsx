import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { IconUser } from '@ui/icon/components/TablerIcons';
import { IconBrandGemini } from '@ui/icon/components/IconBrandGemini';
import { IllustrationIconArray } from '@ui/icon/components/IllustrationIconArray';
import { IconChartBarHorizontal } from '@ui/icon/components/IconChartBarHorizontal';
import { ThinkingOrbitLoaderIcon } from '@ui/icon/components/ThinkingOrbitLoaderIcon';
import { Button } from '@ui/primitives/input/Button/Button';
import { Chip } from '@ui/primitives/data-display/Chip/Chip';
import { Text } from '@ui/primitives/typography/Text/Text';

import { IconsProvider } from '@ui/icon/providers/IconsProvider';
import { ComponentDecorator } from '@ui/testing/decorators/ComponentDecorator';

import { Icon } from '../Icon';

const meta: Meta<typeof Icon> = {
  title: 'UI/Icon/Icon',
  component: Icon,
  decorators: [
    ComponentDecorator,
    (Story) => (
      <IconsProvider>
        <Story />
      </IconsProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const Default: Story = {
  args: {
    name: 'IconUser',
  },
};

export const WithCustomSize: Story = {
  args: {
    name: 'IconSettings',
    size: 32,
  },
};

export const WithCustomColor: Story = {
  args: {
    name: 'IconHeart',
    color: 'red',
    size: 24,
  },
};

export const WithCustomStroke: Story = {
  args: {
    name: 'IconStar',
    size: 24,
    stroke: 1,
  },
};

export const InvalidName: Story = {
  args: {
    name: 'NonExistentIcon',
  },
};

export const ConstrainedRows: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <div
        role="group"
        aria-label="Tabler icon"
        style={{ display: 'flex', width: 96, gap: 8 }}
      >
        <IconUser size={24} aria-hidden="true" />
        <Text truncate>People with a long display name</Text>
      </div>
      <div
        role="group"
        aria-label="Brand icon"
        style={{ display: 'flex', width: 96, gap: 8 }}
      >
        <IconBrandGemini size={24} />
        <Text truncate>Gemini with a long display name</Text>
      </div>
      <div
        role="group"
        aria-label="Illustration icon"
        style={{ display: 'flex', width: 96, gap: 8 }}
      >
        <IllustrationIconArray size={24} />
        <Text truncate>Array with a long display name</Text>
      </div>
      <div
        role="group"
        aria-label="Wrapped icon"
        style={{ display: 'flex', width: 96, gap: 8 }}
      >
        <IconChartBarHorizontal size={24} />
        <Text truncate>Chart with a long display name</Text>
      </div>
      <div
        role="group"
        aria-label="Loader icon"
        style={{ display: 'flex', width: 96, gap: 8 }}
      >
        <ThinkingOrbitLoaderIcon size={24} />
        <Text truncate>Thinking about a long request</Text>
      </div>
      <Chip
        role="group"
        aria-label="Chip icon"
        startElement={<IconBrandGemini size={14} />}
        maxWidth={96}
      >
        Gemini with a long display name
      </Chip>
      <Button startIcon={<IconUser />} style={{ width: 96 }}>
        People with a long display name
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const name of [
      'Tabler icon',
      'Brand icon',
      'Illustration icon',
      'Wrapped icon',
      'Loader icon',
    ]) {
      const row = canvas.getByRole('group', { name });
      const icon = row.querySelector('svg');

      await expect(icon).not.toBeNull();
      await expect(icon?.getBoundingClientRect().width).toBe(24);
    }

    const chipIcon = canvas
      .getByRole('group', { name: 'Chip icon' })
      .querySelector('svg');

    await expect(chipIcon).not.toBeNull();
    await expect(chipIcon?.getBoundingClientRect().width).toBe(14);

    const button = canvas.getByRole('button', {
      name: 'People with a long display name',
    });
    const buttonIcon = button.querySelector('svg');

    await expect(buttonIcon).not.toBeNull();
    await expect(buttonIcon?.getBoundingClientRect().width).toBe(14);
  },
};

export const ExplicitShrink: Story = {
  render: () => (
    <div
      role="group"
      aria-label="Shrinking icon"
      style={{ display: 'flex', width: 96, gap: 8 }}
    >
      <IconUser size={24} style={{ flexShrink: 1 }} aria-hidden="true" />
      <Text style={{ flexShrink: 0 }}>People with a long display name</Text>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const row = within(canvasElement).getByRole('group', {
      name: 'Shrinking icon',
    });
    const icon = row.querySelector('svg');

    await expect(icon).not.toBeNull();
    await expect(icon?.getBoundingClientRect().width).toBeLessThan(24);
  },
};
