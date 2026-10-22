import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { LightButton } from '@ui/components/input/LightButton/LightButton';
import { IconCalendarEvent, IconMail } from '@ui/icon';
import { Chip } from '@ui/primitives/data-display/Chip/Chip';
import { Input } from '@ui/primitives/input/Input/Input';
import { Select } from '@ui/primitives/input/Select/Select';
import { Switch } from '@ui/primitives/input/Switch/Switch';
import { Text } from '@ui/primitives/typography/Text/Text';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { ComposerFieldRow } from '../ComposerFieldRow';

const handleShowCcBcc = fn();
const handleFullDayChange = fn();

const meta: Meta<typeof ComposerFieldRow> = {
  id: 'ui-input-composerfieldrow',
  title: 'UI/Components/Input/ComposerFieldRow',
  component: ComposerFieldRow,
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 520 },
    a11y: A11Y_DEFER_COLOR_CONTRAST,
  },
  args: {
    label: 'Subject',
    children: (
      <Input
        variant="plain"
        aria-label="Subject"
        defaultValue="Project update"
      />
    ),
  },
  argTypes: {
    startIcon: { control: false },
    trailing: { control: false },
    children: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof ComposerFieldRow>;

export const Display: Story = {};

export const Clickable: Story = {
  args: { onClick: fn() },
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', { name: 'Subject' });

    await expect(getComputedStyle(group).cursor).toBe('pointer');
  },
};

export const EmailFields: Story = {
  render: (args) => (
    <>
      <ComposerFieldRow
        label="To"
        dir={args.dir}
        startIcon={<IconMail size={16} />}
        trailing={
          <LightButton size="sm" onClick={handleShowCcBcc}>
            Cc/Bcc
          </LightButton>
        }
      >
        <Chip>Jordan Lee</Chip>
        <Input
          aria-label="Recipient address"
          variant="plain"
          placeholder="Add recipient"
          style={{ flex: '1 1 100px' }}
        />
      </ComposerFieldRow>
      <ComposerFieldRow
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...args}
        hasDivider={false}
      />
    </>
  ),
};

export const CalendarFields: Story = {
  render: () => (
    <>
      <ComposerFieldRow
        label="Calendar"
        startIcon={<IconCalendarEvent size={16} />}
      >
        <Select.Root
          defaultValue="work"
          items={[
            { value: 'work', label: 'Work' },
            { value: 'personal', label: 'Personal' },
          ]}
        >
          <Select.Trigger aria-label="Calendar">
            <Select.Value />
            <Select.Icon />
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner>
              <Select.Popup>
                <Select.Item value="work">
                  <Select.ItemText>Work</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
                <Select.Item value="personal">
                  <Select.ItemText>Personal</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </ComposerFieldRow>
      <ComposerFieldRow
        label="All day"
        hasDivider={false}
        trailing={
          <Switch aria-label="All day" onCheckedChange={handleFullDayChange} />
        }
      >
        <Text size="md" color="secondary">
          Use dates without a time
        </Text>
      </ComposerFieldRow>
    </>
  ),
};

export const KeyboardFocus: Story = {
  ...EmailFields,
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const recipient = canvas.getByRole('textbox', {
      name: 'Recipient address',
    });
    const action = canvas.getByRole('button', { name: 'Cc/Bcc' });
    const subject = canvas.getByRole('textbox', { name: 'Subject' });
    const group = canvas.getByRole('group', { name: 'To' });
    const neutralBackground = getComputedStyle(group).backgroundColor;

    for (const control of [recipient, action, subject]) {
      await userEvent.tab();
      await expect(control).toHaveFocus();
      await expect(getComputedStyle(control).outlineStyle).not.toBe('none');
      await expect(
        Number.parseFloat(getComputedStyle(control).outlineWidth),
      ).toBeGreaterThan(0);
      await expect(getComputedStyle(group).backgroundColor).toBe(
        neutralBackground,
      );
    }

    await userEvent.tab({ shift: true });
    await userEvent.keyboard('{Enter}');
    await expect(handleShowCcBcc).toHaveBeenCalledOnce();
  },
};

export const CalendarKeyboard: Story = {
  ...CalendarFields,
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selector = canvas.getByRole('combobox', { name: 'Calendar' });
    const toggle = canvas.getByRole('switch', { name: 'All day' });
    const neutralBorder = getComputedStyle(selector).borderColor;

    await userEvent.tab();
    await expect(selector).toHaveFocus();
    await expect(getComputedStyle(selector).borderColor).not.toBe(
      neutralBorder,
    );
    await userEvent.keyboard('{Enter}');
    const body = within(canvasElement.ownerDocument.body);
    const workOption = await body.findByRole('option', { name: 'Work' });

    await waitFor(() => expect(workOption).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(workOption).not.toBeVisible());
    await expect(selector).toHaveFocus();
    await userEvent.tab();
    await expect(toggle).toHaveFocus();
    await expect(getComputedStyle(toggle).outlineStyle).not.toBe('none');
    await userEvent.keyboard(' ');
    await expect(toggle).toBeChecked();
    await expect(handleFullDayChange).toHaveBeenCalledOnce();
  },
};

export const ExplicitHover: Story = {
  parameters: { pseudo: { hover: ['.static-row', '.hoverable-row'] } },
  render: () => (
    <>
      <ComposerFieldRow label="Static" className="static-row">
        <Input variant="plain" aria-label="Static" />
      </ComposerFieldRow>
      <ComposerFieldRow
        label="Hoverable"
        className="hoverable-row"
        isHoverable
        hasDivider={false}
      >
        <Input variant="plain" aria-label="Hoverable" />
      </ComposerFieldRow>
    </>
  ),
};

export const NarrowLayout: Story = {
  parameters: { container: { width: 280 } },
  render: () => (
    <ComposerFieldRow
      label="Primary recipients"
      labelWidth={120}
      startIcon={<IconMail size={16} />}
    >
      <Chip>Jordan Lee</Chip>
      <Chip>Alex Morgan</Chip>
      <Text>customer-research-and-product-operations@example.com</Text>
    </ComposerFieldRow>
  ),
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', {
      name: 'Primary recipients',
    });

    await expect(group).toBeVisible();
    await expect(group.scrollWidth).toBeLessThanOrEqual(group.clientWidth);
  },
};

export const WithoutLabel: Story = {
  args: { label: undefined, 'aria-label': 'Subject field' },
};

export const Disabled: Story = {
  args: {
    children: (
      <Input
        variant="plain"
        aria-label="Subject"
        defaultValue="Project update"
        disabled
      />
    ),
    trailing: <LightButton disabled>Clear</LightButton>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('textbox', { name: 'Subject' }),
    ).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Clear' })).toBeDisabled();
  },
};

export const RightToLeft: Story = { ...EmailFields, args: { dir: 'rtl' } };

export const Dark: Story = {
  ...EmailFields,
  globals: { colorScheme: 'dark' },
  tags: ['!autodocs'],
};
