import { type Meta, type StoryObj } from '@storybook/react-vite';

import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { IconSearch } from '@ui/icon';
import { Input } from '@ui/input/Input/Input';
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
