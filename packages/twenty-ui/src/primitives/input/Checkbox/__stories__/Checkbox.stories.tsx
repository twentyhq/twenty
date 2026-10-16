import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useId, useState } from 'react';
import { Heading, Text } from '@ui/primitives/typography';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Checkbox } from '@ui/primitives/input/Checkbox/Checkbox';
import { Button } from '@ui/primitives/input/Button/Button';
import { type CheckboxProps } from '@ui/primitives/input/Checkbox/types/CheckboxProps';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

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
    <label htmlFor={checkboxId}>
      <Checkbox
        name="updates"
        value="email"
        defaultChecked
        {...props}
        id={checkboxId}
      />
      Receive product updates
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
    <div style={{ display: 'grid', gap: 24, width: '100%' }}>
      {CHECKBOX_CATALOG_GROUPS.map(({ label, examples }) => (
        <section key={label} aria-label={label}>
          <Heading level={3}>{label}</Heading>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 24,
              marginTop: 12,
            }}
          >
            {examples.map(({ label: exampleLabel, props }) => (
              <label
                key={exampleLabel}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Checkbox
                  defaultChecked={props.defaultChecked}
                  indeterminate={props.indeterminate}
                  disabled={props.disabled}
                  color={props.color}
                  size={props.size}
                  shape={props.shape}
                  variant={props.variant}
                />
                <Text>{exampleLabel}</Text>
              </label>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};
export const CatalogDark: Story = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
