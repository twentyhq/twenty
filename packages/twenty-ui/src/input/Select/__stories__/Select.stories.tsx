import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { Select } from '../Select';
import {
  SelectExample,
  type SelectExampleProps,
  SELECT_ITEMS,
} from './SelectExample';
import { waitForSelectPopup } from './waitForSelectPopup';

const meta: Meta<typeof SelectExample> = {
  title: 'UI/Input/Select',
  component: SelectExample,
};

export default meta;
type Story = StoryObj<typeof SelectExample>;

export const Default: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 240, height: 200 } },
  args: { defaultValue: 'apple' },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox', {
      name: 'Fruit',
    });
    await expect(trigger).toHaveTextContent('Apple');
    await userEvent.click(trigger);
    const popup = await waitForSelectPopup(canvasElement);
    await expect(
      within(popup).getByRole('option', { name: 'Apple' }),
    ).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(
      within(popup).getByRole('option', { name: 'Cherry' }),
    );
    await waitFor(() => expect(popup).not.toBeVisible());
    await expect(trigger).toHaveTextContent('Cherry');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const Placeholder: Story = {
  ...Default,
  args: {},
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox');
    await expect(trigger).toHaveTextContent('Choose a fruit');
    await expect(trigger).toHaveAttribute('data-placeholder');
    await userEvent.click(trigger);
    const popup = await waitForSelectPopup(canvasElement);
    await userEvent.click(within(popup).getByRole('option', { name: 'Apple' }));
    await waitFor(() => expect(popup).not.toBeVisible());
    await expect(trigger).toHaveTextContent('Apple');
    await expect(trigger).not.toHaveAttribute('data-placeholder');
  },
};

export const Multiple: Story = {
  ...Default,
  args: { multiple: true, defaultValue: ['apple'] },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox');
    await userEvent.click(trigger);
    const popup = await waitForSelectPopup(canvasElement);
    await expect(popup).toHaveAttribute('aria-multiselectable', 'true');
    const apple = within(popup).getByRole('option', { name: 'Apple' });
    const cherry = within(popup).getByRole('option', { name: 'Cherry' });
    await userEvent.click(cherry);
    await expect(popup).toBeVisible();
    await expect(apple).toHaveAttribute('aria-selected', 'true');
    await expect(cherry).toHaveAttribute('aria-selected', 'true');
    await expect(trigger).toHaveTextContent('Apple, Cherry');
    await userEvent.click(apple);
    await expect(apple).toHaveAttribute('aria-selected', 'false');
    await expect(trigger).toHaveTextContent('Cherry');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeVisible());
    await expect(trigger).toHaveFocus();
  },
};

export const Grouped: Story = {
  ...Default,
  render: () => (
    <Select.Root items={SELECT_ITEMS} defaultValue="apple">
      <Select.Trigger aria-label="Fruit">
        <Select.Value />
      </Select.Trigger>
      <Select.Popup>
        <Select.Group>
          <Select.GroupLabel>Everyday</Select.GroupLabel>
          <Select.Item value="apple">Apple</Select.Item>
          <Select.Item value="cherry">Cherry</Select.Item>
        </Select.Group>
        <Select.Separator />
        <Select.Group>
          <Select.GroupLabel>Tropical</Select.GroupLabel>
          <Select.Item value="dragon-fruit">Dragon fruit</Select.Item>
        </Select.Group>
      </Select.Popup>
    </Select.Root>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox'));
    const popup = await waitForSelectPopup(canvasElement);
    await expect(
      within(popup).getByRole('group', { name: 'Everyday' }),
    ).toBeVisible();
    await expect(
      within(popup).getByRole('group', { name: 'Tropical' }),
    ).toBeVisible();
    await expect(within(popup).getByRole('presentation')).toBeVisible();
  },
};

const SelectCatalogCell = ({
  size,
  disabled,
  multiple,
  defaultOpen,
}: SelectExampleProps) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const triggerId = useId();

  return (
    <div
      ref={setContainer}
      data-select-catalog=""
      style={{ width: 180, height: defaultOpen ? 180 : 40 }}
    >
      <Select.Root
        items={SELECT_ITEMS}
        value={multiple ? ['apple', 'cherry'] : 'apple'}
        multiple={multiple}
        disabled={disabled}
        open={defaultOpen}
        modal={false}
      >
        <Select.Trigger id={triggerId} size={size} aria-label="Fruit">
          <Select.Value />
        </Select.Trigger>
        <Select.Popup container={container}>
          {SELECT_ITEMS.map(({ value, label }) => (
            <Select.Item
              key={value}
              value={value}
              disabled={value === 'banana'}
            >
              {label}
            </Select.Item>
          ))}
        </Select.Popup>
      </Select.Root>
    </div>
  );
};

export const Catalog: CatalogStory<Story, typeof SelectExample> = {
  render: (args) => <SelectCatalogCell {...args} />,
  decorators: [CatalogDecorator],
  parameters: {
    a11y: {
      ...A11Y_DEFER_COLOR_CONTRAST,
      config: {
        rules: [
          ...A11Y_DEFER_COLOR_CONTRAST.config.rules,
          {
            id: 'aria-hidden-focus',
            // Simultaneously open selects keep Base UI's focus sentinels active.
            // Keep all other catalog content covered by this rule.
            selector:
              '[aria-hidden="true"]:not([data-select-catalog] [data-base-ui-focus-guard])',
          },
        ],
      },
    },
    catalog: {
      dimensions: [
        {
          name: 'size',
          values: ['sm', 'md'],
          props: (size: SelectExampleProps['size']) => ({ size }),
        },
        {
          name: 'state',
          values: ['default', 'disabled', 'open', 'multiple'],
          props: (state: string) => ({
            disabled: state === 'disabled',
            defaultOpen: state === 'open' || state === 'multiple',
            multiple: state === 'multiple',
          }),
        },
      ],
      options: { elementContainer: { style: { width: 180 } } },
    },
  },
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const popups = within(canvasElement).getAllByRole('listbox');
      expect(popups).toHaveLength(4);
      for (const popup of popups) {
        expect(getComputedStyle(popup).opacity).toBe('1');
      }
    });
  },
};

export const CatalogDark: CatalogStory<Story, typeof SelectExample> = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
