import { type Meta, type StoryObj } from '@storybook/react-vite';

import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { NumberStepper } from '../NumberStepper';

const meta: Meta<typeof NumberStepper> = {
  title: 'UI/Input/NumberStepper',
  component: NumberStepper,
  args: { 'aria-label': 'Quantity', defaultValue: 3, min: 0, max: 10 },
};

export default meta;
type Story = StoryObj<typeof NumberStepper>;

export const Default: Story = {
  decorators: [ComponentDecorator],
};

export const WithoutButtons: Story = {
  decorators: [ComponentDecorator],
  args: { showButtons: false },
};

type NumberStepperCatalogState =
  | 'default'
  | 'minimum'
  | 'maximum'
  | 'disabled'
  | 'readOnly'
  | 'invalid';

const getNumberStepperCatalogStateProps = (
  state: NumberStepperCatalogState,
) => ({
  defaultValue: state === 'minimum' ? 0 : state === 'maximum' ? 10 : 3,
  disabled: state === 'disabled',
  readOnly: state === 'readOnly',
  'aria-invalid': state === 'invalid' || undefined,
});

export const Catalog: CatalogStory<Story, typeof NumberStepper> = {
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
          ] satisfies NumberStepperCatalogState[],
          props: getNumberStepperCatalogStateProps,
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

export const CatalogDark: CatalogStory<Story, typeof NumberStepper> = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
