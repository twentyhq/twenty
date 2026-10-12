import { type Meta, type StoryObj } from '@storybook/react-vite';
import { TabButton } from '@ui/components/navigation/TabButton/TabButton';
import { ComponentDecorator } from '@ui/testing';
import { useRef } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { MatchingTabContent as MatchingTabContentPresentation } from './TabButton.stories';

const meta: Meta<typeof TabButton> = {
  id: 'ui-components-tabbutton-interactions',
  title: 'UI/Components/Navigation/TabButton/Interactions',
  component: TabButton,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof TabButton>;

export const KeyboardAction: Story = {
  args: { children: 'New view', onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'New view' });
    button.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(args.onClick).toHaveBeenCalledTimes(2);
    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toHaveAttribute('aria-selected');
    expect(button).not.toHaveAttribute('aria-controls');
    expect(canvas.queryByRole('tab')).not.toBeInTheDocument();
  },
};

export const DisabledLink: Story = {
  args: {
    children: 'Unavailable',
    href: '#unavailable',
    disabled: true,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Unavailable' });
    expect(link).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(link);
    expect(args.onClick).not.toHaveBeenCalled();
    expect(link).not.toHaveAttribute('type');
  },
};

export const RouteComposition: Story = {
  args: { onClick: fn((event) => event.preventDefault()) },
  render: function Render(args) {
    const anchorRef = useRef<HTMLAnchorElement>(null);
    return (
      <nav aria-label="Workspace pages">
        <TabButton
          {...args}
          active
          aria-current="page"
          nativeButton={false}
          role="link"
          render={(props) => (
            <a {...props} href="#overview">
              {props.children}
            </a>
          )}
          ref={anchorRef}
          onFocus={() => {
            anchorRef.current?.setAttribute('data-ref-target', 'anchor');
          }}
        >
          Overview
        </TabButton>
        <TabButton href="#settings">Settings</TabButton>
      </nav>
    );
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const route = canvas.getByRole('link', { name: 'Overview' });
    route.focus();
    expect(route).toHaveAttribute('data-ref-target', 'anchor');
    expect(route.tagName).toBe('A');
    expect(route).toHaveAttribute('aria-current', 'page');
    await userEvent.keyboard('{Enter}');
    expect(args.onClick).toHaveBeenCalledTimes(1);
    expect(canvas.getByRole('link', { name: 'Settings' })).not.toHaveAttribute(
      'aria-current',
    );
    expect(canvas.queryByRole('tablist')).not.toBeInTheDocument();
    expect(canvas.queryByRole('tabpanel')).not.toBeInTheDocument();
  },
};

export const MatchingTabContent: Story = {
  ...MatchingTabContentPresentation,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Messages 12' });
    const tab = canvas.getByRole('tab', { name: 'Messages 12' });
    expect(button.getBoundingClientRect().width).toBe(
      tab.getBoundingClientRect().width,
    );
    expect(button.getBoundingClientRect().height).toBe(
      tab.getBoundingClientRect().height,
    );
    expect(getComputedStyle(button).color).toBe(getComputedStyle(tab).color);
  },
};
