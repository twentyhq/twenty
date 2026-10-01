import { type Meta, type StoryObj } from '@storybook/react-vite';

import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { NumberInput } from '../NumberInput';

const meta: Meta<typeof NumberInput> = {
  title: 'UI/Input/NumberInput',
  component: NumberInput,
  args: { 'aria-label': 'Quantity', defaultValue: 3, min: 0, max: 10 },
};

export default meta;
type Story = StoryObj<typeof NumberInput>;

export const Default: Story = {
  decorators: [ComponentDecorator],
};

export const WithoutButtons: Story = {
  decorators: [ComponentDecorator],
  args: { showButtons: false },
};

type NumberInputCatalogState =
  | 'default'
  | 'minimum'
  | 'maximum'
  | 'disabled'
  | 'readOnly'
  | 'invalid';

const getNumberInputCatalogStateProps = (state: NumberInputCatalogState) => ({
  defaultValue: state === 'minimum' ? 0 : state === 'maximum' ? 10 : 3,
  disabled: state === 'disabled',
  readOnly: state === 'readOnly',
  'aria-invalid': state === 'invalid' || undefined,
});

export const Catalog: CatalogStory<Story, typeof NumberInput> = {
  decorators: [CatalogDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'state',
          values: [
            'default',
            'minimum',
            'maximum',
            'disabled',
            'readOnly',
            'invalid',
          ] satisfies NumberInputCatalogState[],
          props: getNumberInputCatalogStateProps,
        },
        {
          name: 'buttons',
          values: ['visible', 'hidden'],
          props: (buttons: string) => ({ showButtons: buttons === 'visible' }),
        },
      ],
    },
  },
};

export const CatalogDark: CatalogStory<Story, typeof NumberInput> = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
