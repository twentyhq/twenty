import { Section } from '@ui/components/layout/Section/Section';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator } from '@ui/testing';

const LONG_DESCRIPTION =
  'Manage your workspace name, members, preferences, connected accounts, and notification settings. These settings apply to everyone in your workspace.';

const meta: Meta<typeof Section.Header> = {
  id: 'ui-components-section',
  title: 'UI/Components/Layout/Section',
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
  decorators: WithDescription.decorators,
  args: WithDescription.args,
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

export const WithActions: Story = {
  ...WithDescription,
  args: {
    ...WithDescription.args,
    actions: <Button onClick={handleEdit}>Edit workspace</Button>,
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
    description: LONG_DESCRIPTION,
    descriptionLineClamp: 2,
    isDescriptionFocusable: true,
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
    await waitFor(() =>
      expect(
        within(document.body).queryByRole('tooltip'),
      ).not.toBeInTheDocument(),
    );
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

export const DefaultDescriptionFocus: Story = {
  ...Default,
  args: {
    title: <Text render={<span />}>Workspace details</Text>,
    level: 4,
    size: 'lg',
    description: LONG_DESCRIPTION,
    descriptionLineClamp: 2,
    actions: <Button>Edit details</Button>,
  },
  parameters: LongDescription.parameters,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', {
      level: 4,
      name: 'Workspace details',
    });
    await expect(heading).toHaveAttribute('data-size', 'lg');
    const description = canvas.getByText(LONG_DESCRIPTION);
    await expect(description).not.toHaveAttribute('tabindex');
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Edit details' }),
    ).toHaveFocus();
    await userEvent.hover(description);
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole('tooltip')).toHaveTextContent(
      description.textContent ?? '',
    );
    await userEvent.unhover(description);
    await waitFor(() =>
      expect(body.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
  },
};

export const FullDescription: Story = {
  ...Default,
  args: {
    description: LONG_DESCRIPTION,
    descriptionLineClamp: false,
  },
  parameters: LongDescription.parameters,
  play: async ({ canvasElement }) => {
    const description = within(canvasElement).getByText(LONG_DESCRIPTION);
    await expect(getComputedStyle(description).webkitLineClamp).toBe('none');
    await expect(description.scrollHeight).toBe(description.clientHeight);
    await expect(description).not.toHaveAttribute('tabindex');
  },
};
