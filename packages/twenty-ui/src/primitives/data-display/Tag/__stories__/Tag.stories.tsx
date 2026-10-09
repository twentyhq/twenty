import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { IconUser } from '@ui/icon';
import { Text } from '@ui/primitives/typography/Text/Text';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { type ThemeColor, MAIN_COLOR_NAMES } from '@ui/theme';

import { Tag } from '@ui/primitives/data-display/Tag/Tag';

const meta: Meta<typeof Tag> = {
  title: 'UI/Data Display/Tag',
  component: Tag,
  args: {
    children: 'Urgent',
  },
};

export default meta;
type Story = StoryObj<typeof Tag>;

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

export const WithIcon: Story = {
  decorators: [ComponentDecorator],
  args: {
    color: 'green',
    children: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    startIcon: <IconUser />,
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    container: { width: 100 },
  },
};

export const WithoutTruncation: Story = {
  decorators: [ComponentDecorator],
  args: {
    color: 'green',
    children: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    truncate: false,
    style: { minWidth: 'fit-content' },
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    container: { width: 100 },
  },
};

export const WithoutPadding: Story = {
  ...Default,
  args: {
    ...Default.args,
    style: { padding: 0 },
    title: 'Unpadded category',
  },
  play: async ({ canvasElement }) => {
    const tag = within(canvasElement).getByTitle('Unpadded category');

    await expect(tag).toBeVisible();
    await expect(getComputedStyle(tag).padding).toBe('0px');
  },
};

export const Truncation: Story = {
  ...WithLongText,
  play: async ({ canvasElement }) => {
    const text = within(canvasElement).getByText(
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    );

    await expect(getComputedStyle(text).textOverflow).toBe('ellipsis');
    await expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
    await userEvent.hover(text);

    const tooltip = await within(canvasElement.ownerDocument.body).findByRole(
      'tooltip',
    );

    await waitFor(() => expect(tooltip).toBeVisible());
    await expect(tooltip).toHaveTextContent(
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    );
  },
};

export const FullLabel: Story = {
  ...WithoutTruncation,
  play: async ({ canvasElement }) => {
    const text = within(canvasElement).getByText(
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    );

    await expect(getComputedStyle(text).textOverflow).not.toBe('ellipsis');
    await expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth);
    await userEvent.hover(text);
    await expect(
      within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
    ).not.toBeInTheDocument();
  },
};

export const Catalog: CatalogStory<Story, typeof Tag> = {
  argTypes: {
    color: { control: false },
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      options: { elementContainer: { style: { width: 80 } } },
      dimensions: [
        {
          name: 'variants',
          values: ['soft', 'solid', 'outline', 'ghost'],
          props: (variant: 'soft' | 'solid' | 'outline' | 'ghost') => ({
            variant,
          }),
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

export const EmptyTag: Story = {
  decorators: [ComponentDecorator],
  args: {
    color: 'transparent',
    children: 'No Value',
    variant: 'outline',
    borderStyle: 'dashed',
    weight: 'medium',
  },
  parameters: {
    container: { width: 'auto' },
  },
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
    variant: 'solid',
    style: { padding: 0 },
  },
  render: ({ onClick, ...args }) => (
    <Tag {...args} render={<button type="button" onClick={onClick} />} />
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
    await expect(control).toHaveAttribute('data-variant', 'solid');
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
    onClick: fn(),
    color: 'blue',
  },
  render: ({ onClick, ...args }) => (
    <Tag
      {...args}
      render={<button type="button" disabled onClick={onClick} />}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const control = within(canvasElement).getByRole('button', {
      name: 'Unavailable',
    });
    await expect(control).toBeDisabled();
    await userEvent.click(control);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const RenderCallback: Story = {
  ...PointerAndKeyboard,
  render: ({ onClick, ...args }) => (
    <Tag
      {...args}
      render={(props) => <button {...props} type="button" onClick={onClick} />}
    />
  ),
};

export const DefaultSemantics: Story = {
  ...Default,
  args: {
    ...Default.args,
    title: 'Category label',
    onClick: fn(),
    ref: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const tag = canvas.getByTitle('Category label');

    await expect(tag.tagName).toBe('SPAN');
    await expect(tag).not.toHaveAttribute('role');
    await expect(tag).not.toHaveAttribute('tabindex');
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await expect(args.ref).toHaveBeenCalledWith(tag);
    await userEvent.click(tag);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Navigation: Story = {
  ...PointerAndKeyboard,
  args: {
    ...PointerAndKeyboard.args,
    children: 'Customer records',
    onClick: fn((event) => event.preventDefault()),
  },
  render: ({ onClick, ...args }) => (
    <Tag
      {...args}
      render={(props) => (
        <a
          {...props}
          href="#customer-records"
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
      name: 'Customer records',
    });

    await expect(link.tagName).toBe('A');
    await expect(link).toHaveAttribute('href', '#customer-records');
    await expect(link).toHaveAttribute('referrerpolicy', 'no-referrer');
    await expect(args.ref).toHaveBeenCalledWith(link);
    link.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledOnce();
    await expect(link).toHaveFocus();
  },
};

export const NodeContent: Story = {
  ...Default,
  args: {
    ...Default.args,
    children: (
      <>
        Category:{' '}
        <Text
          render={(props) => (
            <a {...props} href="#enterprise-customers">
              {props.children}
            </a>
          )}
          style={{ display: 'inline' }}
        >
          Enterprise customer
        </Text>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Enterprise customer' });

    await expect(canvas.getByText('Category:')).toBeVisible();
    await expect(link).toHaveAttribute('href', '#enterprise-customers');
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};
