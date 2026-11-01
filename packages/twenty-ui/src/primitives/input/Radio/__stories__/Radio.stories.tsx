import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { IconLayoutKanban, IconTable } from '@ui/icon';
import { RadioGroup } from '@ui/primitives/input/RadioGroup/RadioGroup';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
  GroupedCatalog,
} from '@ui/testing';

import { Radio } from '../Radio';
import { type RadioProps } from '../types/RadioProps';

import { RadioCardContent } from './RadioCardContent';

const RadioExample = ({
  selected = false,
  ...props
}: RadioProps & { selected?: boolean }) => (
  <RadioGroup aria-label="Choice" defaultValue={selected ? props.value : ''}>
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

export const Display: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 320 } },
  argTypes: {
    value: { control: false },
    children: { control: false },
    selected: { control: false },
  },
  render: (args) => (
    <RadioDisplayExample
      size={args.size}
      variant={args.variant}
      disabled={args.disabled}
    />
  ),
};

export const Default: Story = {
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const radio = within(canvasElement).getByRole('radio');

    await userEvent.click(radio);
    await expect(radio).toBeChecked();
  },
};

const RadioDisplayExample = (
  props: Pick<RadioProps, 'size' | 'variant' | 'disabled'>,
) => (
  <RadioGroup
    name="contactMethod"
    defaultValue="email"
    aria-label="Preferred contact method"
  >
    <Radio value="email" {...props}>
      Email
    </Radio>
    <Radio value="phone" {...props}>
      Phone
    </Radio>
    <Radio value="post" {...props} disabled>
      Postal mail (unavailable)
    </Radio>
  </RadioGroup>
);

const RADIO_CATALOG_GROUPS: {
  label: string;
  examples: { label: string; selected?: boolean; props: Partial<RadioProps> }[];
}[] = [
  {
    label: 'States',
    examples: [
      { label: 'Unselected', props: {} },
      { label: 'Selected', selected: true, props: {} },
      { label: 'Disabled', props: { disabled: true } },
      { label: 'Disabled selected', selected: true, props: { disabled: true } },
      { label: 'Read only', selected: true, props: { readOnly: true } },
    ],
  },
  {
    label: 'Sizes',
    examples: [
      { label: 'Small', selected: true, props: { size: 'sm' } },
      { label: 'Medium', selected: true, props: { size: 'md' } },
    ],
  },
  {
    label: 'Variants',
    examples: [
      { label: 'Default', selected: true, props: { variant: 'default' } },
      { label: 'Card', selected: true, props: { variant: 'card' } },
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
      groups={RADIO_CATALOG_GROUPS}
      renderExample={({ label, selected, props }) => (
        <RadioGroup
          aria-label={label}
          defaultValue={selected ? 'option' : ''}
          style={props.variant === 'card' ? { width: 240 } : undefined}
        >
          <Radio
            value="option"
            disabled={props.disabled}
            readOnly={props.readOnly}
            size={props.size}
            variant={props.variant}
          >
            {props.variant === 'card' ? (
              <RadioCardContent
                icon={<IconTable size={20} aria-hidden />}
                title="Table view"
                description="Browse records in rows."
              />
            ) : (
              label
            )}
          </Radio>
        </RadioGroup>
      )}
    />
  ),
};
export const CatalogDark: typeof Catalog = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};

export const CardsDocumentation: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <RadioGroup
      aria-label="Default view"
      defaultValue="table"
      style={{ width: 280 }}
    >
      <Radio variant="card" value="table">
        <RadioCardContent
          icon={<IconTable size={20} aria-hidden />}
          title="Table view"
          description="Browse records in rows."
        />
      </Radio>
      <Radio variant="card" value="board">
        <RadioCardContent
          icon={<IconLayoutKanban size={20} aria-hidden />}
          title="Board view"
          description="Track progress across columns."
        />
      </Radio>
    </RadioGroup>
  ),
};

export const PartsDocumentation: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <RadioGroup aria-label="Storage" defaultValue="ssd">
      <Radio.Root value="ssd">
        <Radio.Indicator keepMounted>✓</Radio.Indicator>
        SSD
      </Radio.Root>
      <Radio.Root value="hdd">
        <Radio.Indicator keepMounted>✓</Radio.Indicator>
        HDD
      </Radio.Root>
    </RadioGroup>
  ),
};

type RadioState = 'default' | 'hover' | 'focus' | 'disabled' | 'readOnly';

const VISUAL_REGRESSION_STATE_PROPS: Record<RadioState, Partial<RadioProps>> = {
  default: {},
  hover: { className: 'hover' },
  focus: { className: 'focus' },
  disabled: { disabled: true },
  readOnly: { readOnly: true },
};

export const VisualRegression: CatalogStory<Story, typeof RadioExample> = {
  tags: ['!autodocs'],
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
          values: Object.keys(VISUAL_REGRESSION_STATE_PROPS),
          props: (state: RadioState) => VISUAL_REGRESSION_STATE_PROPS[state],
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

export const VisualRegressionDark: typeof VisualRegression = {
  ...VisualRegression,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};

export const CardsVisualRegression: typeof VisualRegression = {
  ...VisualRegression,
  args: { variant: 'card' },
};

export const CardsVisualRegressionDark: typeof VisualRegression = {
  ...CardsVisualRegression,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
