import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { IconCoins, IconInfoCircle } from '@ui/icon';
import { Badge } from '@ui/primitives/data-display/Badge/Badge';
import { type BadgeColor } from '@ui/primitives/data-display/Badge/types/BadgeColor';
import { type BadgeShape } from '@ui/primitives/data-display/Badge/types/BadgeShape';
import { type BadgeSize } from '@ui/primitives/data-display/Badge/types/BadgeSize';
import { Button } from '@ui/primitives/input/Button/Button';
import { Tabs } from '@ui/primitives/navigation/Tabs/Tabs';
import { Text } from '@ui/primitives/typography/Text/Text';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

const meta: Meta<typeof Badge> = {
  title: 'UI/Data Display/Badge',
  component: Badge,
  args: { children: 'Soon' },
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const badge = within(canvasElement).getByText('Soon');

    await expect(badge).toBeVisible();
    await expect(badge).toHaveAttribute('data-badge-size', 'sm');
    await expect(badge).toHaveAttribute('data-badge-color', 'tertiary');
    await expect(badge).toHaveAttribute('data-badge-shape', 'pill');
    await expect(badge).toHaveStyle({ height: '16px' });
  },
};

export const Catalog: CatalogStory<Story, typeof Badge> = {
  args: { children: 3 },
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'size',
          values: ['xs', 'sm', 'md'] satisfies BadgeSize[],
          props: (size: BadgeSize) => ({ size }),
        },
        {
          name: 'color',
          values: [
            'tertiary',
            'inherit',
            'primary',
            'secondary',
          ] satisfies BadgeColor[],
          props: (color: BadgeColor) => ({ color }),
        },
        {
          name: 'shape',
          values: ['pill', 'circle'] satisfies BadgeShape[],
          props: (shape: BadgeShape) => ({ shape }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
  play: async ({ canvasElement }) => {
    const badges = within(canvasElement).getAllByText('3');
    await expect(badges).toHaveLength(24);

    for (const badge of badges) {
      await expect(badge).toBeVisible();
      const badgeStyle = getComputedStyle(badge);
      const expectedHeight = { xs: '14px', sm: '16px', md: '18px' }[
        badge.getAttribute('data-badge-size') as BadgeSize
      ];
      await expect(badgeStyle.height).toBe(expectedHeight);

      if (badge.getAttribute('data-badge-shape') === 'circle') {
        await expect(badgeStyle.width).toBe(expectedHeight);
        await expect(badgeStyle.borderRadius).toBe('50%');
      }
    }
  },
};

export const Documentation: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 360 } },
  render: () => (
    <Tabs.Root defaultValue="overview">
      <Tabs.List aria-label="Record details">
        <Tabs.Tab
          value="overview"
          startIcon={<IconInfoCircle aria-hidden="true" />}
          badge={
            <Badge size="xs" color="secondary" shape="circle">
              3
            </Badge>
          }
        >
          Overview
        </Tabs.Tab>
        <Tabs.Tab value="activity" badge={<Badge>Soon</Badge>}>
          Activity
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="overview" style={{ padding: 'var(--t-spacing-4)' }}>
        <Badge color="inherit" size="md">
          <IconCoins aria-hidden="true" size={12} />
          +2 credits
        </Badge>
      </Tabs.Panel>
      <Tabs.Panel value="activity">Recent activity</Tabs.Panel>
    </Tabs.Root>
  ),
};

const NativeCompositionExample = () => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLElement>(null);
  const linkRef = useRef<HTMLElement>(null);
  const [result, setResult] = useState('Ready');
  const [pointerEntries, setPointerEntries] = useState(0);
  const [spanActivations, setSpanActivations] = useState(0);
  const [buttonActivations, setButtonActivations] = useState(0);
  const [renderedButtonActivations, setRenderedButtonActivations] = useState(0);
  const [linkActivations, setLinkActivations] = useState(0);

  return (
    <>
      <Badge
        ref={spanRef}
        aria-label="Reward"
        data-reward="credits"
        className="consumer-badge"
        style={{ marginTop: 7 }}
        onMouseEnter={(event) => {
          setPointerEntries((entries) => entries + 1);
          setResult(
            spanRef.current === event.currentTarget
              ? 'Span ref confirmed'
              : 'Unexpected span ref',
          );
        }}
        onClick={(event) => {
          setSpanActivations((activations) => activations + 1);
          setResult(
            spanRef.current === event.currentTarget
              ? 'Span click ref confirmed'
              : 'Unexpected span ref',
          );
        }}
      >
        <IconCoins aria-hidden="true" size={12} />
        <strong>+2 credits</strong>
      </Badge>
      <Badge aria-label="Caller supplied zero">{0}</Badge>
      <Badge aria-label="Caller formatted count">99+</Badge>
      <Badge
        ref={buttonRef}
        render={
          <Button
            size="sm"
            onClick={() =>
              setRenderedButtonActivations((activations) => activations + 1)
            }
          />
        }
        onClick={(event) => {
          setButtonActivations((activations) => activations + 1);
          setResult(
            buttonRef.current === event.currentTarget
              ? 'Button ref confirmed'
              : 'Unexpected button ref',
          );
        }}
      >
        Review credits
      </Badge>
      <Badge
        ref={linkRef}
        onClick={(event) => {
          event.preventDefault();
          setLinkActivations((activations) => activations + 1);
          setResult(
            linkRef.current === event.currentTarget
              ? 'Link ref confirmed'
              : 'Unexpected link ref',
          );
        }}
        render={(props) => (
          <a {...props} href="#credits">
            {props.children}
          </a>
        )}
      >
        Credit history
      </Badge>
      <output aria-label="Native composition result">{result}</output>
      <output aria-label="Span pointer entries">{pointerEntries}</output>
      <output aria-label="Span activations">{spanActivations}</output>
      <output aria-label="Badge button activations">{buttonActivations}</output>
      <output aria-label="Rendered button activations">
        {renderedButtonActivations}
      </output>
      <output aria-label="Link activations">{linkActivations}</output>
    </>
  );
};

export const NativeComposition: Story = {
  decorators: [ComponentDecorator],
  render: () => <NativeCompositionExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByLabelText('Reward');
    await expect(badge.tagName).toBe('SPAN');
    await expect(badge).toHaveClass('consumer-badge');
    await expect(badge).toHaveAttribute('data-reward', 'credits');
    await expect(badge).toHaveStyle({ marginTop: '7px' });
    const reward = canvas.getByText('+2 credits');
    await expect(reward.tagName).toBe('STRONG');
    await expect(reward).toBeVisible();
    const zero = canvas.getByLabelText('Caller supplied zero');
    await expect(zero).toBeVisible();
    await expect(zero).toHaveTextContent('0');
    const formattedCount = canvas.getByLabelText('Caller formatted count');
    await expect(formattedCount).toBeVisible();
    await expect(formattedCount).toHaveTextContent('99+');
    await userEvent.hover(badge);
    await expect(
      canvas.getByLabelText('Span pointer entries'),
    ).toHaveTextContent('1');
    await expect(
      canvas.getByLabelText('Native composition result'),
    ).toHaveTextContent('Span ref confirmed');
    await userEvent.click(badge);
    await expect(canvas.getByLabelText('Span activations')).toHaveTextContent(
      '1',
    );
    await expect(
      canvas.getByLabelText('Native composition result'),
    ).toHaveTextContent('Span click ref confirmed');
    await expect(badge.tagName).toBe('SPAN');
    await expect(badge).not.toHaveAttribute('role');
    await expect(badge).not.toHaveAttribute('tabindex');
    const button = canvas.getByRole('button', { name: 'Review credits' });
    button.focus();
    await userEvent.keyboard('{Enter}');
    await expect(button).toHaveFocus();
    await expect(
      canvas.getByLabelText('Badge button activations'),
    ).toHaveTextContent('1');
    await expect(
      canvas.getByLabelText('Rendered button activations'),
    ).toHaveTextContent('1');
    await expect(
      canvas.getByLabelText('Native composition result'),
    ).toHaveTextContent('Button ref confirmed');
    const link = canvas.getByRole('link', { name: 'Credit history' });
    await expect(link).toHaveAttribute('href', '#credits');
    await userEvent.click(link);
    await expect(canvas.getByLabelText('Link activations')).toHaveTextContent(
      '1',
    );
    await expect(
      canvas.getByLabelText('Native composition result'),
    ).toHaveTextContent('Link ref confirmed');
    await userEvent.keyboard('{Enter}');
    await expect(link).toHaveFocus();
    await expect(canvas.getByLabelText('Link activations')).toHaveTextContent(
      '2',
    );
  },
};

export const ComposedAppearance: Story = {
  decorators: [ComponentDecorator],
  args: {
    children: 3,
    size: 'xs',
    color: 'primary',
    shape: 'pill',
    ref: fn(),
    onClick: fn(),
  },
  render: (args) => (
    <Text style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Badge
        size={args.size}
        color={args.color}
        shape={args.shape}
        aria-label="Available credits"
      >
        {args.children}
      </Badge>
      <Badge
        {...args}
        render={<Button />}
        aria-label="Review credits"
        data-credit="available"
      />
    </Text>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const reference = canvas.getByLabelText('Available credits');
    const button = canvas.getByRole('button', { name: 'Review credits' });
    const referenceStyle = getComputedStyle(reference);
    const buttonStyle = getComputedStyle(button);

    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute('data-credit', 'available');
    await expect(args.ref).toHaveBeenCalledWith(button);
    await expect(buttonStyle.height).toBe('14px');
    await expect(buttonStyle.fontSize).toBe(referenceStyle.fontSize);
    await expect(buttonStyle.backgroundColor).toBe(
      referenceStyle.backgroundColor,
    );
    await expect(buttonStyle.color).toBe(referenceStyle.color);
    await expect(buttonStyle.borderRadius).toBe(referenceStyle.borderRadius);
    await expect(buttonStyle.paddingInlineStart).toBe(
      referenceStyle.paddingInlineStart,
    );
    button.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
