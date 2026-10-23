import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type FormEventHandler } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { LightButton } from '@ui/components/input/LightButton/LightButton';
import { LightIconButton } from '@ui/components/input/LightIconButton/LightIconButton';
import { IconPlus } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { type ButtonProps } from '@ui/primitives/input/Button/types/ButtonProps';
import { type ButtonVariant } from '@ui/primitives/input/Button/types/ButtonVariant';
import { ButtonGroup } from '@ui/primitives/input/ButtonGroup/ButtonGroup';
import { Text } from '@ui/primitives/typography';
import { themeCssVariables } from '@ui/theme';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { MainButton } from '../MainButton';

type MainButtonStoryProps = ButtonProps & {
  onFormSubmit?: FormEventHandler<HTMLFormElement>;
};

const meta: Meta<MainButtonStoryProps> = {
  id: 'ui-components-mainbutton',
  title: 'UI/Components/Input/MainButton',
  component: MainButton,
  args: { children: 'Save changes' },
};

export default meta;
type Story = StoryObj<MainButtonStoryProps>;

export const Display: Story = { decorators: [ComponentDecorator] };

export const FormControls: Story = {
  ...Display,
  args: {
    onClick: fn(),
    onFormSubmit: fn<FormEventHandler<HTMLFormElement>>((event) =>
      event.preventDefault(),
    ),
  },
  render: (args) => (
    <form onSubmit={args.onFormSubmit}>
      <MainButton onClick={args.onClick}>Preview changes</MainButton>
      <MainButton type="submit" onClick={args.onClick}>
        Save changes
      </MainButton>
    </form>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const previewButton = canvas.getByRole('button', {
      name: 'Preview changes',
    });
    const previewButtonStyle = getComputedStyle(previewButton);

    await expect(previewButtonStyle.fontWeight).toBe('600');
    await expect(previewButtonStyle.paddingInlineStart).toBe('12px');
    await expect(previewButtonStyle.paddingInlineEnd).toBe('12px');
    await expect(previewButtonStyle.boxShadow).not.toBe('none');
    await expect(previewButton).toHaveAttribute('type', 'button');
    await userEvent.click(previewButton);
    await expect(args.onClick).toHaveBeenCalledOnce();
    await expect(args.onFormSubmit).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }));
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await expect(args.onFormSubmit).toHaveBeenCalledOnce();
  },
};

export const Loading: Story = {
  ...Display,
  args: {
    loading: true,
    className: ({ disabled }) => (disabled ? 'unavailable-action' : undefined),
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Save changes',
    });

    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toHaveClass('unavailable-action');
    await expect(getComputedStyle(button).fontWeight).toBe('600');
    await expect(button.querySelector('div')).toHaveStyle({
      borderColor: getComputedStyle(button).color,
    });
  },
};

export const Outline: Story = {
  ...Display,
  args: { variant: 'outline' },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button');
    const buttonStyle = getComputedStyle(button);
    const primaryColor = buttonStyle
      .getPropertyValue('--t-font-color-primary')
      .trim();

    await expect(button).toBeEnabled();
    await expect(buttonStyle.color).toBe(primaryColor);
    await userEvent.hover(button);
    await expect(getComputedStyle(button).color).toBe(primaryColor);
  },
};

export const OutlineDark: Story = {
  ...Outline,
  globals: { colorScheme: 'dark' },
};

export const LoadingOutline: Story = {
  ...Loading,
  args: { ...Loading.args, variant: 'outline' },
};

export const DisabledOutline: Story = {
  ...Display,
  args: { variant: 'outline', elevated: false, disabled: true, onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');

    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('data-variant', 'outline');
    await expect(getComputedStyle(button).boxShadow).toBe('none');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

const CATALOG_STATES: Record<string, Partial<ButtonProps>> = {
  default: {},
  small: { size: 'sm' },
  disabled: { disabled: true },
  loading: { loading: true },
};

export const Catalog: CatalogStory<Story, typeof MainButton> = {
  decorators: [CatalogDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'state',
          values: Object.keys(CATALOG_STATES),
          props: (state: string) => CATALOG_STATES[state] ?? {},
        },
        {
          name: 'variant',
          values: ['solid', 'outline'],
          props: (variant: ButtonVariant) => ({ variant }),
        },
      ],
      options: { elementContainer: { style: { width: 100 } } },
    },
  },
};

export const CatalogDark: CatalogStory<Story, typeof MainButton> = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};

export const InheritedColorGroup: Story = {
  render: () => (
    <Text
      style={{
        background: themeCssVariables.color.blue,
        color: themeCssVariables.font.color.onAccent,
        padding: themeCssVariables.spacing[4],
      }}
    >
      <ButtonGroup
        variant="outline"
        color="inherit"
        aria-label="Surface actions"
      >
        <Button>Grouped action</Button>
        <MainButton>Main action</MainButton>
        <LightButton>Light action</LightButton>
        <LightIconButton aria-label="Add action">
          <IconPlus />
        </LightIconButton>
      </ButtonGroup>
    </Text>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Surface actions' });
    const inheritedColor = getComputedStyle(group).color;

    for (const button of within(group).getAllByRole('button')) {
      await expect(button).toHaveAttribute('data-variant', 'outline');
      await expect(button).toHaveAttribute('data-color', 'inherit');
      await expect(getComputedStyle(button).color).toBe(inheritedColor);
    }
  },
};
