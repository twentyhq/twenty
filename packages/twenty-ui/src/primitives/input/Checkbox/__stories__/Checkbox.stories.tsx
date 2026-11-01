import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useId, useState } from 'react';
import { Text } from '@ui/primitives/typography';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Checkbox } from '@ui/primitives/input/Checkbox/Checkbox';
import { Button } from '@ui/primitives/input/Button/Button';
import { type CheckboxColor } from '@ui/primitives/input/Checkbox/types/CheckboxColor';
import { type CheckboxSize } from '@ui/primitives/input/Checkbox/types/CheckboxSize';
import { type CheckboxProps } from '@ui/primitives/input/Checkbox/types/CheckboxProps';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
  GroupedCatalog,
} from '@ui/testing';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Input/Checkbox/Checkbox',
  component: Checkbox,
  args: { 'aria-label': 'Checkbox' },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Display: Story = {
  args: { 'aria-label': undefined },
  decorators: [ComponentDecorator],
  parameters: { container: { width: 320 } },
  render: (args) => <CheckboxDisplayExample {...args} />,
};

const ControlledExample = (props: CheckboxProps) => {
  const [checked, setChecked] = useState(false);
  return (
    <>
      <Checkbox {...props} checked={checked} />
      <Button
        type="button"
        aria-label="Apply selection"
        onClick={() => setChecked(true)}
      >
        Apply selection
      </Button>
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

const CheckboxDisplayExample = (props: ComponentProps<typeof Checkbox>) => {
  const generatedCheckboxId = useId();
  const checkboxId = props.id ?? generatedCheckboxId;

  return (
    <label
      htmlFor={checkboxId}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
    >
      <Checkbox
        name="updates"
        value="email"
        defaultChecked
        {...props}
        id={checkboxId}
      />
      <Text render={<span />}>Receive product updates</Text>
    </label>
  );
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

const CHECKBOX_CATALOG_GROUPS: {
  label: string;
  examples: { label: string; props: Partial<CheckboxProps> }[];
}[] = [
  {
    label: 'States',
    examples: [
      { label: 'Unchecked', props: {} },
      { label: 'Checked', props: { defaultChecked: true } },
      { label: 'Indeterminate', props: { indeterminate: true } },
      { label: 'Disabled', props: { disabled: true } },
      {
        label: 'Disabled checked',
        props: { defaultChecked: true, disabled: true },
      },
    ],
  },
  {
    label: 'Colors',
    examples: [
      { label: 'Accent', props: { color: 'accent', defaultChecked: true } },
      { label: 'Success', props: { color: 'success', defaultChecked: true } },
      { label: 'Warning', props: { color: 'warning', defaultChecked: true } },
    ],
  },
  {
    label: 'Sizes and shapes',
    examples: [
      { label: 'Small', props: { size: 'sm', defaultChecked: true } },
      { label: 'Medium', props: { size: 'md', defaultChecked: true } },
      { label: 'Round', props: { shape: 'round', defaultChecked: true } },
    ],
  },
  {
    label: 'Variants',
    examples: [
      { label: 'Solid', props: { variant: 'solid', defaultChecked: true } },
      { label: 'Outline', props: { variant: 'outline', defaultChecked: true } },
      { label: 'Soft', props: { variant: 'soft', defaultChecked: true } },
    ],
  },
];

export const Catalog: Story = {
  decorators: [ComponentDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    container: { width: 640 },
  },
  render: () => (
    <GroupedCatalog
      groups={CHECKBOX_CATALOG_GROUPS}
      renderExample={({ label, props }) => (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Checkbox
            defaultChecked={props.defaultChecked}
            indeterminate={props.indeterminate}
            disabled={props.disabled}
            color={props.color}
            size={props.size}
            shape={props.shape}
            variant={props.variant}
          />
          <Text>{label}</Text>
        </label>
      )}
    />
  ),
};
export const CatalogDark: Story = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};

type VisualRegressionState =
  | 'unchecked'
  | 'checked'
  | 'mixed'
  | 'disabled'
  | 'disabled on';

const VISUAL_REGRESSION_STATE_PROPS: Record<
  VisualRegressionState,
  Partial<CheckboxProps>
> = {
  unchecked: {},
  checked: { checked: true },
  mixed: { indeterminate: true },
  disabled: { disabled: true },
  'disabled on': { checked: true, disabled: true },
};

export const VisualRegression: CatalogStory<Story, typeof Checkbox> = {
  tags: ['!autodocs'],
  decorators: [CatalogDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'state',
          values: Object.keys(VISUAL_REGRESSION_STATE_PROPS),
          props: (state: VisualRegressionState) =>
            VISUAL_REGRESSION_STATE_PROPS[state],
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

export const VisualRegressionDark: CatalogStory<Story, typeof Checkbox> = {
  ...VisualRegression,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};

export const SoftVisualRegression: CatalogStory<Story, typeof Checkbox> = {
  ...VisualRegression,
  args: { variant: 'soft' },
};

export const SoftVisualRegressionDark: CatalogStory<Story, typeof Checkbox> = {
  ...SoftVisualRegression,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
