import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { RadioGroup } from '@ui/primitives/input/RadioGroup/RadioGroup';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { Radio } from '../Radio';
import { type RadioProps } from '../types/RadioProps';

const RadioExample = ({
  selected = false,
  ...props
}: RadioProps & { selected?: boolean }) => (
  <RadioGroup defaultValue={selected ? props.value : ''}>
    <Radio {...props} />
  </RadioGroup>
);

const meta: Meta<typeof RadioExample> = {
  title: 'UI/Input/Radio',
  component: RadioExample,
  args: { value: 'radio', children: 'Radio' },
};

export default meta;
type Story = StoryObj<typeof RadioExample>;

type RadioState = 'default' | 'hover' | 'focus' | 'disabled' | 'readOnly';

const STATE_PROPS: Record<RadioState, Partial<RadioProps>> = {
  default: {},
  hover: { className: 'hover' },
  focus: { className: 'focus' },
  disabled: { disabled: true },
  readOnly: { readOnly: true },
};

export const Default: Story = {
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const radio = within(canvasElement).getByRole('radio');

    await userEvent.click(radio);
    await expect(radio).toBeChecked();
  },
};

export const Documentation: Story = {
  ...Default,
  play: undefined,
};

export const Catalog: CatalogStory<Story, typeof RadioExample> = {
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: { hover: ['.hover'], focusVisible: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'selected',
          values: [false, true],
          props: (selected: boolean) => ({ selected }),
        },
        {
          name: 'state',
          values: Object.keys(STATE_PROPS),
          props: (state: RadioState) => STATE_PROPS[state],
        },
        {
          name: 'size',
          values: ['sm', 'md'],
          props: (size: RadioProps['size']) => ({ size }),
        },
      ],
      options: { elementContainer: { style: { width: 160 } } },
    },
  },
  decorators: [CatalogDecorator],
};

export const CatalogDark: typeof Catalog = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
