import { Section } from '@ui/components/Section/Section';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator } from '@ui/testing';

const meta: Meta<typeof Section.Header> = {
  title: 'UI/Components/Section',
  component: Section.Header,
  args: { title: 'Workspace settings' },
};

export default meta;

type Story = StoryObj<typeof Section.Header>;

export const Default: Story = {
  decorators: [ComponentDecorator],
};

export const WithDescription: Story = {
  ...Default,
  args: { description: 'Manage your workspace name and preferences.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole('heading')).toHaveLength(1);
    await expect(canvas.getByRole('heading')).toHaveAccessibleDescription(
      'Manage your workspace name and preferences.',
    );
  },
};

export const Documentation: Story = {
  ...WithDescription,
  play: undefined,
  render: (args) => (
    <Section.Root>
      <Section.Header {...args} />
      <Text>Workspace preferences appear here.</Text>
    </Section.Root>
  ),
};

export const Centered: Story = {
  ...Default,
  render: () => (
    <Section.Root align="center">Centered section content</Section.Root>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText('Centered section content'),
    ).toHaveStyle({ textAlign: 'center' });
  },
};

export const SecondaryColor: Story = {
  ...Default,
  render: () => (
    <Section.Root color="secondary" fullWidth={false}>
      Supporting section content
    </Section.Root>
  ),
};

const handleEdit = fn();

export const WithAdornment: Story = {
  ...WithDescription,
  args: {
    ...WithDescription.args,
    adornment: <Button onClick={handleEdit}>Edit workspace</Button>,
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Edit workspace',
    });
    handleEdit.mockClear();

    await userEvent.click(button);
    await expect(handleEdit).toHaveBeenCalledTimes(1);
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(handleEdit).toHaveBeenCalledTimes(2);
  },
};

export const LongDescription: Story = {
  ...Default,
  args: {
    description:
      'Manage your workspace name, members, preferences, connected accounts, and notification settings. These settings apply to everyone in your workspace.',
    descriptionLineClamp: 2,
  },
  parameters: { container: { width: 240 } },
  play: async ({ canvasElement }) => {
    const description = within(canvasElement).getByText(
      'Manage your workspace name, members, preferences, connected accounts, and notification settings. These settings apply to everyone in your workspace.',
    );

    await expect(getComputedStyle(description).webkitLineClamp).toBe('2');
    await expect(description.scrollHeight).toBeGreaterThan(
      description.clientHeight,
    );
    description.focus();
    await expect(description).toHaveFocus();
    const tooltip = await within(document.body).findByRole('tooltip');
    await expect(tooltip).toHaveTextContent(
      'These settings apply to everyone in your workspace.',
    );
    await userEvent.keyboard('{Escape}');
  },
};

export const Catalog: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <Section.Root>
      <Section.Header
        title="Workspace settings"
        description="Manage your workspace preferences."
      />
      <Section.Header
        title="Team settings"
        description="Manage your team preferences."
        size="lg"
        level={3}
      />
    </Section.Root>
  ),
};

export const CatalogDark: Story = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
