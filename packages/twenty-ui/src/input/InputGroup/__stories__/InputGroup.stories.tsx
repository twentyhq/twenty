import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { IconSearch } from '@ui/icon';
import { Input } from '@ui/input/Input/Input';
import inputStyles from '@ui/input/Input/Input.module.scss';
import { InputGroup } from '@ui/input/InputGroup/InputGroup';
import { type InputSize } from '@ui/input/types/InputSize';

const meta: Meta<typeof InputGroup> = {
  title: 'UI/Input/InputGroup',
  component: InputGroup,
};

export default meta;

type Story = StoryObj<typeof InputGroup>;

const SEARCH_ICON = <IconSearch size={16} />;

export const Default: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 240 } },
  args: {
    startElement: SEARCH_ICON,
    children: <Input placeholder="Search" />,
  },
};

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
  startElement: adornment === 'end' ? undefined : SEARCH_ICON,
  endElement: adornment === 'start' ? undefined : 'USD',
});

export const Catalog: CatalogStory<Story, typeof InputGroup> = {
  args: { children: <Input placeholder="Search" /> },
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
