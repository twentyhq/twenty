import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { IconArrowRight, IconDownload, IconPlus } from '@ui/icon';
import { Badge } from '@ui/primitives/data-display';
import { Text } from '@ui/primitives/typography';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
  GroupedCatalog,
} from '@ui/testing';
import { Button } from '../Button';
import { type ButtonProps } from '../types/ButtonProps';
import { type ButtonColor } from '../types/ButtonColor';
import { type ButtonVariant } from '../types/ButtonVariant';

const meta: Meta<typeof Button> = {
  title: 'UI/Input/Button/Button',
  component: Button,
  args: { children: 'Save changes' },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Display: Story = { decorators: [ComponentDecorator] };

export const Keyboard: Story = {
  ...Display,
  args: { onClick: fn(), onFocus: fn(), onBlur: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');
    button.focus();
    await expect(args.onFocus).toHaveBeenCalledOnce();
    await userEvent.keyboard('{Enter} ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await userEvent.tab();
    await expect(args.onBlur).toHaveBeenCalledOnce();
  },
};
export const Disabled: Story = {
  ...Display,
  args: { disabled: true, onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
export const LinkAction: Story = {
  ...Keyboard,
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: { ...Keyboard.args, variant: 'link', children: 'Log out' },
};
export const Soon: Story = {
  ...Disabled,
  render: ({ children, ...args }) => (
    <Button {...args}>
      <Text
        render={<span />}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--t-spacing-1)',
        }}
      >
        {children}
        <Badge>Coming soon</Badge>
      </Text>
    </Button>
  ),
};

const LoadingExample = () => {
  const [loading, setLoading] = useState(false);
  return (
    <>
      <Button
        startIcon={<IconPlus />}
        loading={loading}
        onClick={() => setLoading(true)}
      >
        Create record
      </Button>
      <Button onClick={() => setLoading(false)}>Complete request</Button>
    </>
  );
};
export const Loading: Story = {
  ...Display,
  render: () => <LoadingExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Create record' });
    const width = button.getBoundingClientRect().width;
    await userEvent.click(button);
    await expect(canvas.getByText('Create record')).not.toBeVisible();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toBeDisabled();
    await expect(button.getBoundingClientRect().width).toBe(width);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Complete request' }),
    );
    await expect(button).toBeEnabled();
  },
};
export const LoadingAtStart: Story = {
  ...Display,
  args: {
    children: 'Creating record',
    startIcon: <IconPlus />,
    endIcon: <IconArrowRight />,
    loading: true,
    loadingPosition: 'start',
  },
};
export const LoadingAtStartInteraction: Story = {
  ...LoadingAtStart,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Creating record' });
    await expect(canvas.getByText('Creating record')).toBeVisible();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toBeDisabled();
    await expect(button.querySelector('.tabler-icon-plus')).toBeNull();
    await expect(
      button.querySelector('.tabler-icon-arrow-right'),
    ).toBeVisible();
  },
};
export const LoadingAtEnd: Story = {
  ...Display,
  args: {
    children: 'Installing (42%)',
    startIcon: <IconDownload />,
    endIcon: <IconArrowRight />,
    loading: true,
    loadingPosition: 'end',
  },
};
export const LoadingAtEndInteraction: Story = {
  ...LoadingAtEnd,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Installing (42%)' });
    await expect(canvas.getByText('Installing (42%)')).toBeVisible();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toBeDisabled();
    await expect(button.querySelector('.tabler-icon-download')).toBeVisible();
    await expect(button.querySelector('.tabler-icon-arrow-right')).toBeNull();
  },
};
export const NativeForm: Story = {
  ...Display,
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: { onClick: fn() },
  render: (args) => (
    <form aria-label="Profile" onSubmit={(event) => event.preventDefault()}>
      <input aria-label="Name" defaultValue="Ada" />
      <Button {...args} variant="link">
        Default button
      </Button>
      <Button type="reset">Reset</Button>
      <Button type="submit">Submit</Button>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole('form');
    const onSubmit = fn();
    form.addEventListener('submit', onSubmit);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Default button' }),
    );
    await expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
    await expect(onSubmit).toHaveBeenCalledOnce();
    const input = canvas.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'Grace');
    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await expect(input).toHaveValue('Ada');
    form.removeEventListener('submit', onSubmit);
  },
};
export const LinkButton: Story = {
  ...Display,
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    variant: 'link',
    href: '#button-destination',
    target: '_blank',
    rel: 'noreferrer',
    children: 'Read documentation',
  },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link');
    await expect(link).toHaveAttribute('href', '#button-destination');
    await expect(link).not.toHaveAttribute('type');
  },
};
export const DisabledLink: Story = {
  ...Display,
  args: {
    variant: 'link',
    href: '#disabled-destination',
    disabled: true,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const link = within(canvasElement).getByRole('link');
    await expect(link).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(link);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
export const CustomRender: Story = {
  ...Keyboard,
  args: {
    render: <button data-custom-render />,
    onClick: fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
};
export const Icons: Story = {
  ...Display,
  args: {
    startIcon: <IconPlus />,
    endIcon: <IconArrowRight />,
    shortcut: ['Mod', 'Enter'],
  },
};
export const Truncation: Story = {
  ...Display,
  args: {
    children: 'A long button label that must remain inside its container',
    startIcon: <IconPlus />,
    endIcon: <IconArrowRight />,
    style: { width: 220 },
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button');
    await expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth);
  },
};

const BUTTON_CATALOG_GROUPS: {
  label: string;
  examples: { label: string; props: Partial<ButtonProps> }[];
}[] = [
  {
    label: 'Variants',
    examples: [
      { label: 'Solid', props: { variant: 'solid' } },
      { label: 'Outline', props: { variant: 'outline' } },
      { label: 'Soft', props: { variant: 'soft' } },
      { label: 'Ghost', props: { variant: 'ghost' } },
      { label: 'Link', props: { variant: 'link' } },
    ],
  },
  {
    label: 'Colors',
    examples: [
      { label: 'Neutral', props: { color: 'neutral', variant: 'solid' } },
      { label: 'Accent', props: { color: 'accent', variant: 'solid' } },
      { label: 'Danger', props: { color: 'danger', variant: 'solid' } },
      { label: 'Success', props: { color: 'success', variant: 'solid' } },
    ],
  },
  {
    label: 'Sizes',
    examples: [
      { label: 'Small', props: { size: 'sm' } },
      { label: 'Medium', props: { size: 'md' } },
    ],
  },
  {
    label: 'States',
    examples: [
      { label: 'Ready', props: {} },
      { label: 'Disabled', props: { disabled: true } },
      { label: 'Loading', props: { loading: true } },
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
      groups={BUTTON_CATALOG_GROUPS}
      renderExample={({ label, props }) => (
        <>
          <Text>{label}</Text>
          <Button
            variant={props.variant}
            color={props.color}
            size={props.size}
            disabled={props.disabled}
            loading={props.loading}
          >
            Save changes
          </Button>
        </>
      )}
    />
  ),
};
export const CatalogDark: Story = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};

export const NativeButtonWithHref: Story = {
  ...Display,
  args: {
    children: 'Open records',
    nativeButton: true,
    href: '#native-button-destination',
    render: <button data-custom-button />,
    ref: fn(),
    onClick: fn(),
    onPointerDown: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Open records',
    });

    await expect(button.tagName).toBe('BUTTON');
    await expect(button).toHaveAttribute('type', 'button');
    await expect(button).toHaveAttribute('data-custom-button');
    await expect(args.ref).toHaveBeenCalledWith(button);
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'click', button: 0, detail: 1 }),
    );
    await expect(args.onPointerDown).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'pointerdown', pointerType: 'mouse' }),
    );
    await userEvent.keyboard('{Enter} ');
    await expect(args.onClick).toHaveBeenCalledTimes(3);
  },
};

export const CustomButton: Story = {
  ...Display,
  args: {
    children: 'Open records',
    nativeButton: false,
    render: <div data-custom-control />,
    ref: fn(),
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Open records',
    });

    await expect(button.tagName).toBe('DIV');
    await expect(button).not.toHaveAttribute('type');
    await expect(args.ref).toHaveBeenCalledWith(button);
    button.focus();
    await userEvent.keyboard('{Enter} ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

export const NativeAnchorAttributes: Story = {
  ...Display,
  args: {
    children: 'Open records',
    href: '#records-download',
    download: 'records.csv',
    hrefLang: 'en',
    media: 'screen',
    ping: '/download-audit',
    referrerPolicy: 'no-referrer',
    target: '_blank',
    rel: 'noreferrer',
    ref: fn(),
    onClick: fn((event) => event.preventDefault()),
  },
  play: async ({ canvasElement, args }) => {
    const link = within(canvasElement).getByRole('link', {
      name: 'Open records',
    });

    await expect(link.tagName).toBe('A');
    await expect(link).toHaveAttribute('href', '#records-download');
    await expect(link).toHaveAttribute('download', 'records.csv');
    await expect(link).toHaveAttribute('hreflang', 'en');
    await expect(link).toHaveAttribute('media', 'screen');
    await expect(link).toHaveAttribute('ping', '/download-audit');
    await expect(link).toHaveAttribute('referrerpolicy', 'no-referrer');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noreferrer');
    await expect(link).not.toHaveAttribute('type');
    await expect(args.ref).toHaveBeenCalledWith(link);
    await userEvent.click(link);
    await expect(args.onClick).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'click', defaultPrevented: true }),
    );
  },
};

const renderedLinkClick = fn();

export const ComposedNavigation: Story = {
  ...Display,
  args: {
    children: 'Open records',
    nativeButton: false,
    role: 'link',
    render: (
      <a href="#composed-records" type="text/csv" onClick={renderedLinkClick}>
        Open records
      </a>
    ),
    ref: fn(),
    onClick: fn((event) => event.preventDefault()),
  },
  play: async ({ canvasElement, args }) => {
    const link = within(canvasElement).getByRole('link', {
      name: 'Open records',
    });

    await expect(link.tagName).toBe('A');
    await expect(link).toHaveAttribute('href', '#composed-records');
    await expect(link).toHaveAttribute('type', 'text/csv');
    await expect(args.ref).toHaveBeenCalledWith(link);
    link.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledOnce();
    await expect(renderedLinkClick).toHaveBeenCalledOnce();
  },
};

export const RenderCallback: Story = {
  ...Display,
  args: {
    children: 'Open records',
    nativeButton: false,
    role: 'link',
    href: '#callback-records',
    disabled: true,
    ref: fn(),
    onClick: fn(),
    render: (props, state) => (
      <a {...props} data-render-disabled={state.disabled}>
        {props.children}
      </a>
    ),
  },
  play: async ({ canvasElement, args }) => {
    const link = within(canvasElement).getByRole('link', {
      name: 'Open records',
    });

    await expect(link).toHaveAttribute('href', '#callback-records');
    await expect(link).toHaveAttribute('data-render-disabled', 'true');
    await expect(link).toHaveAttribute('aria-disabled', 'true');
    await expect(args.ref).toHaveBeenCalledWith(link);
    await userEvent.click(link);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const CustomButtonKeyboardCancellation: Story = {
  ...CustomButton,
  args: {
    ...CustomButton.args,
    onKeyDown: fn((event) => event.preventBaseUIHandler()),
  },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Open records',
    });

    button.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'Enter' }),
    );
    await expect(args.onClick).not.toHaveBeenCalled();
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

const VISUAL_REGRESSION_STATES: Record<string, Partial<ButtonProps>> = {
  default: {},
  small: { size: 'sm' },
  shortcut: { shortcut: ['H'] },
  disabled: { disabled: true },
  loading: { loading: true },
};
export const VisualRegression: CatalogStory<Story, typeof Button> = {
  tags: ['!autodocs'],
  decorators: [CatalogDecorator],
  args: { children: 'Button' },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'state',
          values: Object.keys(VISUAL_REGRESSION_STATES),
          props: (state: string) => VISUAL_REGRESSION_STATES[state] ?? {},
        },
        {
          name: 'color',
          values: ['neutral', 'accent', 'danger', 'success'],
          props: (color: ButtonColor) => ({ color }),
        },
        {
          name: 'variant',
          values: ['solid', 'outline', 'soft', 'ghost', 'link'],
          props: (variant: ButtonVariant) => ({ variant }),
        },
      ],
      options: { elementContainer: { style: { width: 100 } } },
    },
  },
};
export const VisualRegressionDark: CatalogStory<Story, typeof Button> = {
  ...VisualRegression,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
