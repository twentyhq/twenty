import { type Meta, type StoryObj } from '@storybook/react-vite';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { type ThemeColor, MAIN_COLOR_NAMES } from '@ui/theme';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Status } from '@ui/primitives/data-display/Status/Status';

const meta: Meta<typeof Status> = {
  title: 'UI/Data Display/Status',
  component: Status,
  args: {
    children: 'Urgent',
    weight: 'medium',
  },
};

export default meta;
type Story = StoryObj<typeof Status>;

export const Default: Story = {
  args: {
    color: 'red',
  },
  decorators: [ComponentDecorator],
};

export const Documentation: Story = {
  args: Default.args,
  decorators: Default.decorators,
};

export const WithLongText: Story = {
  decorators: [ComponentDecorator],
  args: {
    color: 'green',
    children: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    container: { width: 100 },
  },
};

export const Loading: Story = {
  ...Default,
  args: {
    children: 'Saving',
    color: 'blue',
    loading: true,
  },
};

export const LoadingAccessibility: Story = {
  ...Loading,
  args: {
    ...Loading.args,
    title: 'Save progress',
    ref: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByTitle('Save progress');

    await expect(status.tagName).toBe('SPAN');
    await expect(status).toHaveAttribute('aria-busy', 'true');
    await expect(status).not.toHaveAttribute('role');
    await expect(status).not.toHaveAttribute('aria-live');
    await expect(canvas.getByText('Saving')).toBeVisible();
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await expect(args.ref).toHaveBeenCalledWith(status);
  },
};

export const Catalog: CatalogStory<Story, typeof Status> = {
  argTypes: {
    color: { control: false },
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'state',
          values: ['default', 'loading'],
          props: (state: string) => ({ loading: state === 'loading' }),
        },
        {
          name: 'colors',
          values: MAIN_COLOR_NAMES,
          props: (color: ThemeColor) => ({ color }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};

export const CatalogDark: typeof Catalog = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};

export const PointerAndKeyboard: Story = {
  decorators: [ComponentDecorator],
  args: {
    children: 'Open details',
    onClick: fn(),
    ref: fn(),
    color: 'blue',
    style: { padding: 0 },
  },
  render: ({ onClick, ...args }) => (
    <Status {...args} render={<button type="button" onClick={onClick} />} />
  ),
  play: async ({ canvasElement, args }) => {
    const control = within(canvasElement).getByRole('button', {
      name: 'Open details',
    });
    await userEvent.click(control);
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(3);
    await expect(control).toHaveFocus();
    await expect(args.ref).toHaveBeenCalledWith(control);
    await expect(getComputedStyle(control).padding).toBe('0px');
    await expect(args.onClick).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'click' }),
    );
  },
};

export const Disabled: Story = {
  decorators: [ComponentDecorator],
  args: {
    children: 'Unavailable',
    loading: true,
    onClick: fn(),
    color: 'blue',
  },
  render: ({ onClick, ...args }) => (
    <Status
      {...args}
      render={<button type="button" disabled onClick={onClick} />}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const control = within(canvasElement).getByRole('button', {
      name: 'Unavailable',
    });
    await expect(control).toBeDisabled();
    await expect(control).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(control);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const RenderCallback: Story = {
  ...PointerAndKeyboard,
  render: ({ onClick, ...args }) => (
    <Status
      {...args}
      render={(props) => <button {...props} type="button" onClick={onClick} />}
    />
  ),
};

export const DefaultSemantics: Story = {
  ...Default,
  args: {
    ...Default.args,
    title: 'Record state',
    onClick: fn(),
    ref: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByTitle('Record state');

    await expect(status.tagName).toBe('SPAN');
    await expect(status).not.toHaveAttribute('role');
    await expect(status).not.toHaveAttribute('tabindex');
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await expect(args.ref).toHaveBeenCalledWith(status);
    await userEvent.click(status);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const LoadingInteraction: Story = {
  ...PointerAndKeyboard,
  args: {
    ...PointerAndKeyboard.args,
    loading: true,
  },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Open details',
    });

    await expect(button).toBeEnabled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Navigation: Story = {
  ...PointerAndKeyboard,
  args: {
    ...PointerAndKeyboard.args,
    children: 'Active records',
    onClick: fn((event) => event.preventDefault()),
  },
  render: ({ onClick, ...args }) => (
    <Status
      {...args}
      render={(props) => (
        <a
          {...props}
          href="#active-records"
          referrerPolicy="no-referrer"
          onClick={onClick}
        >
          {props.children}
        </a>
      )}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const link = within(canvasElement).getByRole('link', {
      name: 'Active records',
    });

    await expect(link.tagName).toBe('A');
    await expect(link).toHaveAttribute('href', '#active-records');
    await expect(link).toHaveAttribute('referrerpolicy', 'no-referrer');
    await expect(args.ref).toHaveBeenCalledWith(link);
    link.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledOnce();
    await expect(link).toHaveFocus();
  },
};
