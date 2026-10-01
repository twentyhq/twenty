import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type MouseEvent } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Text } from '@ui/primitives/typography/Text/Text';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { Breadcrumb } from '../Breadcrumb';

const LONG_CURRENT_LABEL =
  'A company name that needs more room than the page header';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Primitives/Navigation/Breadcrumb',
  component: Breadcrumb,
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 350 },
    a11y: A11Y_DEFER_COLOR_CONTRAST,
  },
  args: {
    links: [
      { children: 'Objects', href: '/objects' },
      { children: 'Companies', href: '/companies' },
      { children: 'New' },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {};

export const Truncation: Story = {
  args: {
    links: [
      { children: 'Objects', href: '/objects' },
      { children: 'Companies', href: '/companies' },
      { children: LONG_CURRENT_LABEL },
    ],
  },
};

export const RichContent: Story = {
  args: {
    links: [
      { children: 'Settings', href: '/settings' },
      {
        children: <Text render={<span />}>Data model</Text>,
        title: 'Data model',
      },
    ],
  },
};

export const LinkedCurrentItem: Story = {
  args: {
    links: [
      { children: 'Objects', href: '/objects' },
      { children: 'Companies', href: '/companies' },
    ],
  },
};

export const Rtl: Story = { args: { dir: 'rtl' } };

export const Dark: Story = { globals: { colorScheme: 'dark' } };

export const Semantics: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigation = canvas.getByRole('navigation', { name: 'Breadcrumb' });

    await expect(within(navigation).getAllByRole('listitem')).toHaveLength(3);
    await expect(within(navigation).getAllByRole('link')).toHaveLength(2);
    await expect(canvas.getByText('New')).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(
      canvas.getByRole('link', { name: 'Objects' }),
    ).not.toHaveAttribute('aria-current');

    for (const separator of canvas.getAllByText('/')) {
      await expect(separator).toHaveAttribute('aria-hidden', 'true');
    }
  },
};

export const LinkActivation: Story = {
  args: {
    ...LinkedCurrentItem.args,
    onClick: fn((event: MouseEvent<HTMLElement>) => event.preventDefault()),
    links: [
      { children: 'Objects', href: '/objects' },
      {
        children: 'Companies',
        href: '/companies',
        render: (
          <a href="/companies" data-composed="true">
            Companies
          </a>
        ),
      },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const objects = canvas.getByRole('link', { name: 'Objects' });
    const companies = canvas.getByRole('link', { name: 'Companies' });

    await userEvent.tab();
    await expect(objects).toHaveFocus();
    await expect(getComputedStyle(objects).outlineStyle).toBe('solid');
    await expect(getComputedStyle(objects).outlineOffset).toBe('-2px');
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await userEvent.tab();
    await expect(companies).toHaveFocus();
    await expect(companies).toHaveAttribute('href', '/companies');
    await expect(companies).toHaveAttribute('data-composed', 'true');
    await expect(companies).toHaveAttribute('aria-current', 'page');
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await userEvent.click(objects);
    await expect(args.onClick).toHaveBeenCalledTimes(3);
  },
};

export const TruncationBehavior: Story = {
  ...Truncation,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const current = canvas.getByText(LONG_CURRENT_LABEL);
    const objects = canvas.getByRole('link', { name: 'Objects' });
    const companies = canvas.getByRole('link', { name: 'Companies' });

    await expect(current.scrollWidth).toBeGreaterThan(current.clientWidth);
    await expect(getComputedStyle(current).textOverflow).toBe('ellipsis');
    await expect(current).toHaveAttribute('title', LONG_CURRENT_LABEL);
    await expect(objects.scrollWidth).toBe(objects.clientWidth);
    await expect(companies.scrollWidth).toBe(companies.clientWidth);
    await expect(current.getBoundingClientRect().right).toBeLessThanOrEqual(
      canvas.getByRole('navigation').getBoundingClientRect().right + 1,
    );
  },
};

export const SingleItem: Story = {
  args: { links: [{ children: 'Settings' }] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Settings')).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
    await expect(canvas.queryByText('/')).not.toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: { links: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('list')).toBeEmptyDOMElement();
    await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
  },
};
