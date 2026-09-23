import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IconSearch } from '@ui/icon';
import { IconButton } from '@ui/components/IconButton/IconButton';
import { ButtonGroup } from '@ui/primitives/input/ButtonGroup/ButtonGroup';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { LightIconButton } from '../LightIconButton';
import { type LightIconButtonProps } from '../types/LightIconButtonProps';

const meta: Meta<typeof LightIconButton> = {
  title: 'UI/Input/Button/LightIconButton',
  component: LightIconButton,
  args: { children: <IconSearch />, 'aria-label': 'Search' },
};
export default meta;
type Story = StoryObj<typeof LightIconButton>;

export const Default: Story = {
  decorators: [ComponentDecorator],
  args: { onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Search',
    });

    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Documentation: Story = {
  ...Default,
  play: undefined,
};

export const Appearance: Story = {
  ...Default,
  render: () => (
    <>
      <LightIconButton aria-label="Standard">
        <IconSearch />
      </LightIconButton>
      <LightIconButton aria-label="Subtle" emphasis="subtle">
        <IconSearch />
      </LightIconButton>
      <LightIconButton aria-label="Medium" size="md">
        <IconSearch />
      </LightIconButton>
      <LightIconButton aria-label="Compact" size="xs">
        <IconSearch />
      </LightIconButton>
      <LightIconButton aria-label="Disabled" disabled>
        <IconSearch />
      </LightIconButton>
      <ButtonGroup color="danger" size="md" variant="solid">
        <LightIconButton aria-label="Group action" emphasis="subtle">
          <IconSearch />
        </LightIconButton>
        <IconButton aria-label="Reference">
          <IconSearch />
        </IconButton>
      </ButtonGroup>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const [name, size, iconSize] of [
      ['Standard', 24, 14],
      ['Subtle', 24, 14],
      ['Medium', 32, 16],
      ['Compact', 20, 14],
    ] as const) {
      const button = canvas.getByRole('button', { name });
      await expect(button.getBoundingClientRect().width).toBe(size);
      await expect(button.getBoundingClientRect().height).toBe(size);
      await expect(
        button.querySelector('svg')?.getBoundingClientRect().width,
      ).toBe(iconSize);
    }
    const standard = canvas.getByRole('button', { name: 'Standard' });
    const subtle = canvas.getByRole('button', { name: 'Subtle' });
    await expect(getComputedStyle(standard).color).not.toBe(
      getComputedStyle(subtle).color,
    );
    const grouped = canvas.getByRole('button', { name: 'Group action' });
    const reference = canvas.getByRole('button', { name: 'Reference' });
    await expect(getComputedStyle(grouped).color).toBe(
      getComputedStyle(reference).color,
    );
    await expect(grouped.getBoundingClientRect().width).toBe(32);
    await expect(
      canvas.getByRole('button', { name: 'Disabled' }),
    ).toBeDisabled();
  },
};

export const AppearanceDark: Story = {
  ...Appearance,
  globals: { colorScheme: 'dark' },
};

const CATALOG_STATES: Record<string, Partial<LightIconButtonProps>> = {
  default: {},
  hover: { className: 'hover' },
  pressed: { className: 'pressed' },
  focused: { className: 'focused' },
  disabled: { disabled: true },
  selected: { color: 'accent', 'aria-pressed': true },
  loading: { loading: true },
};

export const Catalog: CatalogStory<Story, typeof LightIconButton> = {
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
          name: 'emphasis',
          values: ['standard', 'subtle'],
          props: (emphasis: LightIconButtonProps['emphasis']) => ({ emphasis }),
        },
        {
          name: 'size',
          values: ['sm', 'md'],
          props: (size: LightIconButtonProps['size']) => ({ size }),
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button', { name: 'Search' });

    for (const button of buttons) {
      await expect(button).toBeVisible();
    }

    await expect(canvas.getAllByRole('button', { pressed: true })).toHaveLength(
      4,
    );
    await expect(canvas.getAllByRole('button', { busy: true })).toHaveLength(4);
    await expect(
      buttons.filter((button) => button.hasAttribute('disabled')),
    ).toHaveLength(8);
  },
};
export const CatalogDark: CatalogStory<Story, typeof LightIconButton> = {
  ...Catalog,
  globals: { colorScheme: 'dark' },
  tags: ['!autodocs'],
};
