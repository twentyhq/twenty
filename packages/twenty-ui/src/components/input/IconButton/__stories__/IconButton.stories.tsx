import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { IconPlus, IconSearch, IconTrash } from '@ui/icon';
import { Text } from '@ui/primitives/typography';
import { type ButtonColor } from '@ui/primitives/input/Button/types/ButtonColor';
import { type ButtonVariant } from '@ui/primitives/input/Button/types/ButtonVariant';
import { ButtonGroup } from '@ui/primitives/input/ButtonGroup/ButtonGroup';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
  GroupedCatalog,
} from '@ui/testing';

import { IconButton } from '../IconButton';
import { type IconButtonProps } from '../types/IconButtonProps';
import { IconButtonExample } from './IconButtonExample';

const meta: Meta<typeof IconButton> = {
  id: 'ui-components-iconbutton',
  title: 'UI/Components/Input/IconButton',
  component: IconButton,
  args: { children: <IconSearch />, 'aria-label': 'Search' },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Display: Story = { decorators: [ComponentDecorator] };

export const Elevated: Story = {
  ...Display,
  args: {
    elevated: true,
    size: 'sm',
    children: <IconPlus />,
    'aria-label': 'Add widget',
  },
};

export const ElevatedTooltip: Story = {
  ...Elevated,
  args: { ...Elevated.args, tooltip: 'Add widget', tooltipDelay: 0 },
};

const ELEVATED_EXAMPLES: {
  label: string;
  props: Partial<IconButtonProps>;
}[] = [
  { label: 'Regular', props: { 'aria-label': 'Regular action' } },
  {
    label: 'Elevated',
    props: { elevated: true, 'aria-label': 'Elevated action' },
  },
  {
    label: 'Compact',
    props: { elevated: true, size: 'sm', 'aria-label': 'Compact action' },
  },
  {
    label: 'Link',
    props: { href: '#search', 'aria-label': 'Link without elevation' },
  },
  { label: 'Solid', props: { variant: 'solid', 'aria-label': 'Solid action' } },
  {
    label: 'Elevated solid',
    props: {
      variant: 'solid',
      elevated: true,
      'aria-label': 'Elevated solid action',
    },
  },
  {
    label: 'Accent',
    props: { color: 'accent', 'aria-label': 'Accent action' },
  },
  {
    label: 'Elevated accent',
    props: {
      color: 'accent',
      elevated: true,
      'aria-label': 'Elevated accent action',
    },
  },
];

export const ElevatedAppearance: Story = {
  ...Display,
  args: { onClick: fn() },
  render: (args) => (
    <Text
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: 24,
        width: 560,
        maxWidth: '100%',
      }}
    >
      {ELEVATED_EXAMPLES.map(({ label, props }) => (
        <IconButtonExample key={label} label={label}>
          <IconButton {...args} {...props} />
        </IconButtonExample>
      ))}
    </Text>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const regular = canvas.getByRole('button', { name: 'Regular action' });
    const elevated = canvas.getByRole('button', { name: 'Elevated action' });
    const compact = canvas.getByRole('button', { name: 'Compact action' });
    const link = canvas.getByRole('link', { name: 'Link without elevation' });

    await expect(regular.getBoundingClientRect().width).toBe(32);
    await expect(getComputedStyle(regular).boxShadow).toBe('none');
    await expect(getComputedStyle(regular).backdropFilter).toBe('none');
    await expect(getComputedStyle(elevated).backgroundColor).not.toBe(
      getComputedStyle(regular).backgroundColor,
    );
    await expect(getComputedStyle(elevated).borderColor).not.toBe(
      getComputedStyle(regular).borderColor,
    );
    await expect(elevated.getBoundingClientRect().width).toBe(32);
    await expect(elevated).toHaveAttribute('type', 'button');
    await expect(compact.getBoundingClientRect().width).toBe(24);
    await expect(compact.getBoundingClientRect().height).toBe(24);

    for (const button of [elevated, compact]) {
      await expect(getComputedStyle(button).boxShadow).not.toBe('none');
      await expect(getComputedStyle(button).backdropFilter).not.toBe('none');
      await expect(
        button.querySelector('svg')?.getBoundingClientRect().width,
      ).toBe(16);
    }

    for (const [regularName, elevatedName] of [
      ['Solid action', 'Elevated solid action'],
      ['Accent action', 'Elevated accent action'],
    ]) {
      const regularButton = canvas.getByRole('button', { name: regularName });
      const elevatedButton = canvas.getByRole('button', { name: elevatedName });

      for (const property of [
        'backgroundColor',
        'borderColor',
        'color',
      ] as const) {
        await expect(getComputedStyle(elevatedButton)[property]).toBe(
          getComputedStyle(regularButton)[property],
        );
      }
      await expect(getComputedStyle(elevatedButton).boxShadow).not.toBe('none');
      await expect(getComputedStyle(elevatedButton).backdropFilter).not.toBe(
        'none',
      );
    }

    elevated.focus();
    await userEvent.keyboard('{Enter} ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await expect(link).toHaveAttribute('href', '#search');
    await expect(getComputedStyle(link).boxShadow).toBe('none');
    await expect(getComputedStyle(link).backdropFilter).toBe('none');
  },
};

export const ElevatedAppearanceDark: Story = {
  ...ElevatedAppearance,
  globals: { colorScheme: 'dark' },
};

export const Keyboard: Story = {
  ...Display,
  args: { onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Search',
    });

    button.focus();
    await userEvent.keyboard('{Enter} ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const Disabled: Story = {
  ...Display,
  args: { disabled: true, onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Search',
    });

    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Loading: Story = {
  ...Disabled,
  args: { loading: true, onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Search',
    });

    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toBeDisabled();
    await expect(button.getBoundingClientRect().width).toBe(
      button.getBoundingClientRect().height,
    );
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Link: Story = {
  ...Display,
  args: { href: '#search', onClick: fn((event) => event.preventDefault()) },
  play: async ({ canvasElement, args }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Search' });

    await expect(link).toHaveAttribute('href', '#search');
    link.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Tooltip: Story = {
  ...Display,
  args: { tooltip: 'Search records', tooltipDelay: 0 },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Search',
    });

    button.focus();
    await expect(button).toHaveFocus();
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent('Search records');
  },
};

export const TooltipDocumentation: Story = {
  decorators: Tooltip.decorators,
  args: Tooltip.args,
};

export const TooltipDisabled: Story = {
  ...Tooltip,
  args: { ...Tooltip.args, disabled: true, onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Search',
    });

    await expect(button).toBeDisabled();
    await userEvent.hover(button);
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent('Search records');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const TooltipLoading: Story = {
  ...TooltipDisabled,
  args: { ...Tooltip.args, loading: true, onClick: fn() },
};

export const TooltipLink: Story = {
  ...Tooltip,
  args: {
    ...Tooltip.args,
    href: '#search',
    nativeButton: false,
    role: 'link',
    render: (props) => (
      <a {...props} data-custom-render>
        {props.children}
      </a>
    ),
  },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Search' });

    await expect(link).toHaveAttribute('href', '#search');
    await expect(link).toHaveAttribute('data-custom-render');
    await expect(link).not.toHaveAttribute('type');
    link.focus();
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent('Search records');
  },
};

export const Grouped: Story = {
  ...Display,
  render: () => (
    <ButtonGroup
      aria-label="Record actions"
      size="sm"
      variant="solid"
      color="accent"
    >
      <IconButton aria-label="Search">
        <IconSearch />
      </IconButton>
      <IconButton aria-label="Create" tooltip="Create record">
        <IconPlus />
      </IconButton>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const buttons = within(canvasElement).getAllByRole('button');

    for (const button of buttons) {
      await expect(button).toHaveAttribute('data-variant', 'solid');
      await expect(button.getBoundingClientRect().width).toBe(24);
      await expect(button.getBoundingClientRect().height).toBe(24);
    }
  },
};

const CATALOG_STATES: Record<string, Partial<IconButtonProps>> = {
  default: {},
  small: { size: 'sm' },
  elevated: { elevated: true },
  hover: { className: 'hover' },
  pressed: { className: 'pressed' },
  focused: { className: 'focused' },
  disabled: { disabled: true },
  loading: { loading: true },
};

const ICON_BUTTON_CATALOG_GROUPS: {
  label: string;
  examples: { label: string; props: Partial<IconButtonProps> }[];
}[] = [
  {
    label: 'Variants',
    examples: (['solid', 'outline', 'soft', 'ghost'] as const).map(
      (variant) => ({ label: variant, props: { variant } }),
    ),
  },
  {
    label: 'Colors',
    examples: (['neutral', 'accent', 'danger', 'success'] as const).map(
      (color) => ({ label: color, props: { color } }),
    ),
  },
  {
    label: 'Sizes',
    examples: (['xs', 'sm', 'md'] as const).map((size) => ({
      label: size,
      props: { size },
    })),
  },
  {
    label: 'Shapes',
    examples: (['square', 'round'] as const).map((shape) => ({
      label: shape,
      props: { shape },
    })),
  },
  {
    label: 'Elevation',
    examples: [
      { label: 'standard', props: {} },
      { label: 'elevated', props: { elevated: true } },
    ],
  },
  {
    label: 'States',
    examples: [
      'default',
      'hover',
      'pressed',
      'focused',
      'disabled',
      'loading',
    ].map((label) => ({ label, props: CATALOG_STATES[label]! })),
  },
];

export const Catalog: Story = {
  decorators: [ComponentDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: {
      hover: ['.hover'],
      active: ['.pressed'],
      focusVisible: ['.focused'],
    },
  },
  render: (args) => (
    <GroupedCatalog
      groups={ICON_BUTTON_CATALOG_GROUPS}
      renderExample={({ label, props }) => (
        <IconButtonExample label={label}>
          <IconButton {...args} {...props} />
        </IconButtonExample>
      )}
    />
  ),
};

export const CatalogDark: Story = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};

const ROUND_EXAMPLES = [
  { label: '20px', name: 'Compact round', size: 'xs', disabled: false },
  { label: '24px', name: 'Small round', size: 'sm', disabled: false },
  { label: '32px', name: 'Medium round', size: 'md', disabled: false },
  { label: 'Disabled', name: 'Disabled round', size: 'sm', disabled: true },
] as const;

export const RoundDocumentation: Story = {
  ...Display,
  render: () => (
    <Text style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      {ROUND_EXAMPLES.map(({ label, name, size, disabled }) => (
        <IconButtonExample key={name} label={label}>
          <IconButton
            aria-label={name}
            size={size}
            shape="round"
            variant="solid"
            color="accent"
            disabled={disabled}
          >
            <IconPlus />
          </IconButton>
        </IconButtonExample>
      ))}
    </Text>
  ),
};

export const Round: Story = {
  ...RoundDocumentation,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const [name, size] of [
      ['Compact round', 20],
      ['Small round', 24],
      ['Medium round', 32],
      ['Disabled round', 24],
    ] as const) {
      const button = canvas.getByRole('button', { name });
      await expect(button.getBoundingClientRect().width).toBe(size);
      await expect(button.getBoundingClientRect().height).toBe(size);
      await expect(getComputedStyle(button).borderTopLeftRadius).toBe('50%');
    }
    const disabled = canvas.getByRole('button', { name: 'Disabled round' });
    await expect(disabled).toBeDisabled();
    await expect(getComputedStyle(disabled).opacity).toBe('1');
  },
};

export const LabelledBy: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <Text style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Text render={<span />} id="search-records-label">
        Search records
      </Text>
      <IconButton
        aria-labelledby="search-records-label"
        tooltip="Find a record"
        tooltipDelay={0}
      >
        <IconSearch />
      </IconButton>
    </Text>
  ),
};

export const LabelledByInteraction: Story = {
  ...LabelledBy,
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Search records',
    });

    await expect(button).not.toHaveAttribute('aria-label');
    button.focus();
    await expect(button).toHaveFocus();
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent('Find a record');
    await expect(button).toHaveAccessibleName('Search records');
  },
};

export const GroupedOverrides: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <ButtonGroup
      aria-label="Record appearance"
      variant="solid"
      color="accent"
      size="sm"
    >
      <IconButton
        variant="outline"
        color="neutral"
        aria-label="Search records"
        tooltip="Search records"
      >
        <IconSearch />
      </IconButton>
      <IconButton aria-label="Create record" tooltip="Create record">
        <IconPlus />
      </IconButton>
    </ButtonGroup>
  ),
};

export const GroupedOverridesInteraction: Story = {
  ...GroupedOverrides,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchButton = canvas.getByRole('button', { name: 'Search records' });
    const createButton = canvas.getByRole('button', { name: 'Create record' });

    await expect(searchButton).toHaveAttribute('data-variant', 'outline');
    await expect(searchButton).toHaveAttribute('data-color', 'neutral');
    await expect(searchButton).toHaveAttribute('data-icon-size', 'sm');
    await expect(searchButton.getBoundingClientRect().width).toBe(24);
    await expect(searchButton.getBoundingClientRect().height).toBe(24);
    await expect(createButton).toHaveAttribute('data-variant', 'solid');
    await expect(createButton).toHaveAttribute('data-color', 'accent');
    await expect(createButton).toHaveAttribute('data-icon-size', 'sm');
    await expect(createButton.getBoundingClientRect().width).toBe(24);
    await expect(createButton.getBoundingClientRect().height).toBe(24);
  },
};

export const GroupedSizeOverride: Story = {
  decorators: [ComponentDecorator],
  tags: ['!autodocs'],
  render: () => (
    <ButtonGroup
      aria-label="Record actions"
      size="sm"
      attached={false}
      style={{ alignItems: 'center' }}
    >
      <IconButton size="xs" aria-label="Search records">
        <IconSearch />
      </IconButton>
      <IconButton aria-label="Create record">
        <IconPlus />
      </IconButton>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchButton = canvas.getByRole('button', { name: 'Search records' });
    const createButton = canvas.getByRole('button', { name: 'Create record' });

    await expect(searchButton).toHaveAttribute('data-icon-size', 'xs');
    await expect(searchButton.getBoundingClientRect().width).toBe(20);
    await expect(searchButton.getBoundingClientRect().height).toBe(20);
    await expect(createButton).toHaveAttribute('data-icon-size', 'sm');
    await expect(createButton.getBoundingClientRect().width).toBe(24);
    await expect(createButton.getBoundingClientRect().height).toBe(24);
  },
};

export const FramedGroupDocumentation: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <ButtonGroup framed attached={false} aria-label="Record actions">
      <IconButton size="xs" aria-label="Add" variant="ghost">
        <IconPlus />
      </IconButton>
      <IconButton size="xs" aria-label="Delete" variant="ghost" disabled>
        <IconTrash />
      </IconButton>
    </ButtonGroup>
  ),
};

export const VisualRegression: CatalogStory<Story, typeof IconButton> = {
  tags: ['!autodocs'],
  decorators: [CatalogDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: {
      hover: ['.hover'],
      active: ['.pressed'],
      focusVisible: ['.focused'],
    },
    catalog: {
      dimensions: [
        {
          name: 'state',
          values: Object.keys(CATALOG_STATES),
          props: (state: string) => CATALOG_STATES[state] ?? {},
        },
        {
          name: 'color',
          values: ['neutral', 'accent', 'danger', 'success'],
          props: (color: ButtonColor) => ({ color }),
        },
        {
          name: 'variant',
          values: ['solid', 'outline', 'soft', 'ghost'],
          props: (variant: ButtonVariant) => ({ variant }),
        },
      ],
    },
  },
};

export const VisualRegressionDark: CatalogStory<Story, typeof IconButton> = {
  ...VisualRegression,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
