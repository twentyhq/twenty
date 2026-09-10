import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Checkbox } from '@ui/input/Checkbox/Checkbox';
import { type CheckboxColor } from '@ui/input/Checkbox/types/CheckboxColor';
import { type CheckboxProps } from '@ui/input/Checkbox/types/CheckboxProps';
import { type CheckboxSize } from '@ui/input/Checkbox/types/CheckboxSize';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Input/Checkbox/Checkbox',
  component: Checkbox,
  args: { 'aria-label': 'Checkbox' },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

const ControlledExample = (props: CheckboxProps) => {
  const [checked, setChecked] = useState(false);
  return (
    <>
      <Checkbox {...props} checked={checked} />
      <button type="button" onClick={() => setChecked(true)}>
        Apply selection
      </button>
    </>
  );
};

export const Controlled: Story = {
  args: { onCheckedChange: fn() },
  decorators: [ComponentDecorator],
  render: (args) => <ControlledExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox');
    await userEvent.click(checkbox);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({
        event: expect.objectContaining({ type: 'click' }),
      }),
    );
    await expect(checkbox).not.toBeChecked();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Apply selection' }),
    );
    await expect(checkbox).toBeChecked();
  },
};

export const Default: Story = {
  args: { hoverable: false },
  decorators: [ComponentDecorator],
};

export const Round: Story = {
  args: { shape: 'round', defaultChecked: true },
  decorators: [ComponentDecorator],
};

export const Outline: Story = {
  args: { variant: 'outline' },
  decorators: [ComponentDecorator],
};

export const Success: Story = {
  args: { color: 'success', defaultChecked: true },
  decorators: [ComponentDecorator],
};

export const Warning: Story = {
  args: { color: 'warning', defaultChecked: true },
  decorators: [ComponentDecorator],
};

type CatalogState =
  | 'unchecked'
  | 'checked'
  | 'mixed'
  | 'disabled'
  | 'disabled on';

const CATALOG_STATE_PROPS: Record<CatalogState, Partial<CheckboxProps>> = {
  unchecked: {},
  checked: { checked: true },
  mixed: { indeterminate: true },
  disabled: { disabled: true },
  'disabled on': { checked: true, disabled: true },
};

export const Catalog: CatalogStory<Story, typeof Checkbox> = {
  decorators: [CatalogDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'state',
          values: Object.keys(CATALOG_STATE_PROPS),
          props: (state: CatalogState) => CATALOG_STATE_PROPS[state],
        },
        {
          name: 'color',
          values: ['accent', 'success', 'warning'],
          props: (color: CheckboxColor) => ({ color }),
        },
        {
          name: 'size',
          values: ['sm', 'md'],
          props: (size: CheckboxSize) => ({ size }),
        },
      ],
      options: { elementContainer: { style: { width: 60 } } },
    },
  },
};

export const CatalogDark: CatalogStory<Story, typeof Checkbox> = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};

export const Soft: CatalogStory<Story, typeof Checkbox> = {
  ...Catalog,
  args: { variant: 'soft' },
};

export const SoftDark: CatalogStory<Story, typeof Checkbox> = {
  ...Soft,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
