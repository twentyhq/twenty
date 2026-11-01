import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { LightIconButton } from '@ui/components/input/LightIconButton/LightIconButton';
import { IconNotes, IconPencil, IconTag, IconUser } from '@ui/icon';
import { Chip } from '@ui/primitives/data-display/Chip/Chip';
import { Tag } from '@ui/primitives/data-display/Tag/Tag';
import { Card } from '@ui/primitives/surfaces/Card/Card';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { DetailsRow } from '../DetailsRow';

const handleChangeOwner = fn();

const meta: Meta<typeof DetailsRow> = {
  id: 'ui-data-display-detailsrow',
  title: 'UI/Components/Data display/DetailsRow',
  component: DetailsRow,
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 400 },
    a11y: A11Y_DEFER_COLOR_CONTRAST,
  },
  args: {
    label: 'Owner',
    children: <Chip>Jordan Lee</Chip>,
    startIcon: <IconUser size={16} />,
  },
  argTypes: {
    children: { control: false },
    startIcon: { control: false },
    action: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof DetailsRow>;

export const Display: Story = {
  render: (args) => (
    <Card.Root>
      <Card.Content>
        <dl dir={args.dir} style={{ display: 'grid', gap: 8, margin: 0 }}>
          <DetailsRow
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...args}
          />
          <DetailsRow label="Categories" startIcon={<IconTag size={16} />}>
            <Tag color="blue">Research</Tag>
            <Tag color="purple">Design</Tag>
          </DetailsRow>
          <DetailsRow label="Description" startIcon={<IconNotes size={16} />}>
            A shared collection of customer research and design decisions.
          </DetailsRow>
        </dl>
      </Card.Content>
    </Card.Root>
  ),
};

export const LongContent: Story = {
  parameters: { container: { width: 260 } },
  render: () => (
    <dl style={{ display: 'grid', gap: 8, margin: 0 }}>
      <DetailsRow
        label="Primary project coordinator"
        labelWidth={160}
        startIcon={<IconUser size={16} />}
      >
        Jordan Lee, customer research and product operations
      </DetailsRow>
      <DetailsRow
        label="Reference"
        labelWidth={160}
        startIcon={<IconNotes size={16} />}
      >
        customer-research-archive-2026-accessibility-observations
      </DetailsRow>
      <DetailsRow
        label="Categories"
        labelWidth={160}
        startIcon={<IconTag size={16} />}
      >
        <Tag color="blue">Research</Tag>
        <Tag color="purple">Design</Tag>
        <Tag color="green">Planning</Tag>
      </DetailsRow>
    </dl>
  ),
};

export const NarrowLayout: Story = {
  ...LongContent,
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Primary project coordinator');
    const value = canvas.getByText(
      'Jordan Lee, customer research and product operations',
    );

    await expect(label).toBeVisible();
    await expect(value).toBeVisible();
    await expect(value.getBoundingClientRect().height).toBeGreaterThan(24);

    const list = canvasElement.querySelector('dl');

    await expect(list).not.toBeNull();
    await expect(list!.scrollWidth).toBeLessThanOrEqual(list!.clientWidth);
  },
};

export const WithAction: Story = {
  args: {
    action: (
      <LightIconButton aria-label="Change owner">
        <IconPencil />
      </LightIconButton>
    ),
  },
  render: (args) => (
    <dl style={{ margin: 0 }}>
      <DetailsRow
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...args}
      />
    </dl>
  ),
};

export const ActionKeyboard: Story = {
  ...WithAction,
  tags: ['!autodocs'],
  args: {
    action: (
      <LightIconButton aria-label="Change owner" onClick={handleChangeOwner}>
        <IconPencil />
      </LightIconButton>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const action = canvas.getByRole('button', { name: 'Change owner' });

    await userEvent.tab();
    await expect(action).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(handleChangeOwner).toHaveBeenCalledOnce();
  },
};

export const RightToLeft: Story = {
  ...Display,
  args: { dir: 'rtl' },
};

export const Dark: Story = {
  ...Display,
  globals: { colorScheme: 'dark' },
  tags: ['!autodocs'],
};
