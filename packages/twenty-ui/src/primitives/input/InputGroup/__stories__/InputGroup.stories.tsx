import { Text } from '@ui/primitives/typography';
import { type ComponentProps } from 'react';
import { Field } from '@ui/primitives/input';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { Input } from '@ui/primitives/input/Input/Input';
import inputStyles from '@ui/primitives/input/Input/Input.module.scss';
import { InputGroup } from '@ui/primitives/input/InputGroup/InputGroup';
import { type InputSize } from '@ui/primitives/input/types/InputSize';

const meta: Meta<typeof InputGroup> = {
  title: 'UI/Input/InputGroup',
  component: InputGroup,
};

export default meta;

type Story = StoryObj<typeof InputGroup>;

export const Display: Story = {
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST, container: { width: 320 } },
  render: (args) => <InputGroupDisplayExample {...args} />,
};

const InputGroupDisplayExample = (props: ComponentProps<typeof InputGroup>) => (
  <Field.Root name="website">
    <Field.Label>Website</Field.Label>
    <InputGroup
      startElement={
        <Text render={<span />} aria-hidden>
          https://
        </Text>
      }
      {...props}
    >
      <Input placeholder="example.com" />
    </InputGroup>
    <Field.Description>Enter the domain without https://.</Field.Description>
  </Field.Root>
);

export const WithEndElement: Story = {
  decorators: [ComponentDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    container: { width: 240 },
  },
  args: {
    endElement: 'USD',
    children: <Input placeholder="0.00" />,
  },
};

export const WithBothElements: Story = {
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    startElement: '$',
    endElement: 'USD',
    children: <Input aria-label="Amount" />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('$')).toBeVisible();
    await expect(canvas.getByText('USD')).toBeVisible();
    await expect(canvas.getByRole('textbox', { name: 'Amount' })).toBeVisible();
  },
};

export const EmptyElements: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <>
      <InputGroup startElement={false} endElement="">
        <Input aria-label="Empty adornments" />
      </InputGroup>
      <InputGroup>
        <Input aria-label="No adornments" />
      </InputGroup>
    </>
  ),
  play: async ({ canvasElement }) => {
    for (const input of within(canvasElement).getAllByRole('textbox')) {
      await expect(input.parentElement?.children).toHaveLength(1);
    }
  },
};

export const SizeInheritance: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <>
      <InputGroup size="sm">
        <Input aria-label="Inherited size" />
      </InputGroup>
      <InputGroup size="sm">
        <Input aria-label="Explicit size" size="md" />
      </InputGroup>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inheritedInput = canvas.getByRole('textbox', {
      name: 'Inherited size',
    });
    const explicitInput = canvas.getByRole('textbox', {
      name: 'Explicit size',
    });

    await expect(inheritedInput).toHaveClass(inputStyles.sm);
    await expect(inheritedInput).toHaveAttribute('data-grouped');
    await expect(explicitInput).toHaveClass(inputStyles.md);
    await expect(explicitInput).not.toHaveClass(inputStyles.sm);
  },
};

type InputGroupCatalogAdornment = 'start' | 'end' | 'both';

const getInputGroupCatalogAdornmentProps = (
  adornment: InputGroupCatalogAdornment,
) => ({
  startElement: adornment === 'end' ? undefined : 'https://',
  endElement: adornment === 'start' ? undefined : '.com',
});

export const Catalog: CatalogStory<Story, typeof InputGroup> = {
  args: { children: <Input aria-label="Website" placeholder="example" /> },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'size',
          values: ['sm', 'md'] satisfies InputSize[],
          props: (size: InputSize) => ({ size }),
        },
        {
          name: 'adornment',
          values: [
            'start',
            'end',
            'both',
          ] satisfies InputGroupCatalogAdornment[],
          props: getInputGroupCatalogAdornmentProps,
        },
      ],
      options: {
        elementContainer: { style: { width: 160 } },
      },
    },
  },
  decorators: [CatalogDecorator],
};

export const CatalogDark: CatalogStory<Story, typeof InputGroup> = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};

export const SharedPlainFrame: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <>
      <InputGroup size="sm" role="group" aria-label="Compact frame">
        <Input variant="plain" aria-label="Compact input" />
      </InputGroup>
      <Field.Root invalid>
        <InputGroup role="group" aria-label="Invalid frame">
          <Input aria-label="Invalid grouped input" />
        </InputGroup>
      </Field.Root>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Compact frame' });
    const input = canvas.getByRole('textbox', { name: 'Compact input' });
    const invalidGroup = canvas.getByRole('group', { name: 'Invalid frame' });
    const invalidInput = canvas.getByRole('textbox', {
      name: 'Invalid grouped input',
    });

    await expect(group.getBoundingClientRect().height).toBe(24);
    await expect(invalidGroup.getBoundingClientRect().height).toBe(32);
    await expect(input).toHaveAttribute('data-variant', 'plain');
    await expect(getComputedStyle(input).borderWidth).toBe('0px');
    await userEvent.tab();
    await expect(input).toHaveFocus();
    await expect(getComputedStyle(input).outlineStyle).toBe('none');
    await expect(getComputedStyle(invalidInput).outlineStyle).toBe('none');
    await expect(getComputedStyle(group).borderWidth).toBe('1px');
    await expect(getComputedStyle(invalidGroup).borderColor).not.toBe(
      getComputedStyle(group).borderColor,
    );
  },
};
