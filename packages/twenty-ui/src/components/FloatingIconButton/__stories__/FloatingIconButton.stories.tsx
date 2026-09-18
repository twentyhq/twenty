import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { IconPlus } from '@ui/icon';
import { ButtonGroup } from '@ui/primitives/input/ButtonGroup/ButtonGroup';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { FloatingIconButton } from '../FloatingIconButton';
import { type FloatingIconButtonProps } from '../types/FloatingIconButtonProps';

const meta: Meta<typeof FloatingIconButton> = {
  title: 'UI/Components/FloatingIconButton',
  component: FloatingIconButton,
  args: { children: <IconPlus />, 'aria-label': 'Add widget' },
};

export default meta;
type Story = StoryObj<typeof FloatingIconButton>;

export const Default: Story = { decorators: [ComponentDecorator] };

export const Tooltip: Story = {
  ...Default,
  args: { tooltip: 'Add a widget above this section', tooltipDelay: 0 },
};

export const SurfaceAndKeyboard: Story = {
  ...Default,
  args: { onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Add widget',
    });
    const appearance = getComputedStyle(button);

    await expect(button).toHaveAttribute('type', 'button');
    await expect(button.getBoundingClientRect().width).toBe(24);
    await expect(button.getBoundingClientRect().height).toBe(24);
    await expect(appearance.boxShadow).not.toBe('none');
    await expect(appearance.backdropFilter).not.toBe('none');
    await expect(
      button.querySelector('svg')?.getBoundingClientRect().width,
    ).toBe(16);
    button.focus();
    await userEvent.keyboard('{Enter} ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const DisabledAndLoadingTooltips: Story = {
  ...Default,
  args: { onClick: fn() },
  render: (args) => (
    <ButtonGroup aria-label="Unavailable actions">
      <FloatingIconButton
        {...args}
        disabled
        tooltip="Adding is unavailable"
        tooltipDelay={0}
      />
      <FloatingIconButton
        {...args}
        aria-label="Saving widget"
        loading
        tooltip="Saving changes"
        tooltipDelay={0}
      />
    </ButtonGroup>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const disabled = canvas.getByRole('button', { name: 'Add widget' });
    const loading = canvas.getByRole('button', { name: 'Saving widget' });

    await expect(disabled).toBeDisabled();
    await expect(loading).toBeDisabled();
    await expect(loading).toHaveAttribute('aria-busy', 'true');
    await userEvent.hover(disabled);
    await expect(await body.findByRole('tooltip')).toHaveTextContent(
      'Adding is unavailable',
    );
    await userEvent.click(disabled);
    await userEvent.unhover(disabled);
    await userEvent.hover(loading);
    await waitFor(() =>
      expect(body.getByRole('tooltip')).toHaveTextContent('Saving changes'),
    );
    await userEvent.click(loading);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const LinkWithoutElevation: Story = {
  ...Default,
  args: {
    href: '#widgets',
    elevated: false,
    blur: false,
    size: 'md',
    tooltip: 'Browse widgets',
    tooltipDelay: 0,
    onClick: fn((event) => event.preventDefault()),
    render: (props) => (
      <a {...props} data-custom-render>
        {props.children}
      </a>
    ),
  },
  play: async ({ canvasElement, args }) => {
    const link = within(canvasElement).getByRole('link', {
      name: 'Add widget',
    });

    await expect(link).toHaveAttribute('href', '#widgets');
    await expect(link).toHaveAttribute('data-custom-render');
    await expect(link.getBoundingClientRect().width).toBe(32);
    await expect(getComputedStyle(link).boxShadow).toBe('none');
    await expect(getComputedStyle(link).backdropFilter).toBe('none');
    link.focus();
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent('Browse widgets');
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

const CATALOG_STATES: Record<string, Partial<FloatingIconButtonProps>> = {
  default: {},
  medium: { size: 'md' },
  hover: { className: 'hover' },
  pressed: { className: 'pressed' },
  focused: { className: 'focused' },
  selected: { 'aria-pressed': true },
  disabled: { disabled: true },
  loading: { loading: true },
  flat: { elevated: false, blur: false },
};

export const Catalog: CatalogStory<Story, typeof FloatingIconButton> = {
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
          props: (state: string) => CATALOG_STATES[state],
        },
      ],
    },
  },
};

export const CatalogDark: CatalogStory<Story, typeof FloatingIconButton> = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
