import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type MouseEvent } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Text } from '@ui/primitives/typography/Text/Text';
import { Button } from '@ui/primitives/input/Button/Button';
import { ComponentDecorator } from '@ui/testing';

import { OverflowingTextWithTooltip } from '../OverflowingTextWithTooltip';

const longText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tellus diam, rhoncus nec consequat quis, dapibus quis massa. Praesent tincidunt augue at ex bibendum, non finibus augue faucibus. In at gravida orci. Nulla facilisi. Proin ut augue ut nisi pellentesque tristique. Proin sodales libero id turpis tincidunt posuere. Sed euismod, nunc at aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nunc. Donec euismod, nunc quis aliquam ultricies, nunc nisl aliquet nunc.';

const meta: Meta<typeof OverflowingTextWithTooltip> = {
  title: 'UI/Surfaces/OverflowingTextWithTooltip',
  component: OverflowingTextWithTooltip,
  args: { style: { maxWidth: 200 } },
  render: (args) => (
    <OverflowingTextWithTooltip {...args} data-testid="overflow-text" />
  ),
};

export default meta;
type Story = StoryObj<typeof OverflowingTextWithTooltip>;

export const Display: Story = {
  args: {
    text: 'Quarterly account review and renewal preparation',
    isFocusable: true,
    style: { maxWidth: 220 },
  },
  decorators: [ComponentDecorator],
};

export const SingleLineOverflowing: Story = {
  args: {
    text: longText,
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tooltip = await canvas.findByTestId('overflow-text');
    await userEvent.hover(tooltip);

    const canvasBody = within(canvasElement.ownerDocument.body);

    await expect(
      tooltip.scrollWidth > tooltip.clientWidth ||
        tooltip.scrollHeight > tooltip.clientHeight,
    ).toBe(true);
    const popup = await canvasBody.findByRole('tooltip');

    await waitFor(() => expect(popup).toBeVisible());
  },
};

export const SingleLineNotOverflowing: Story = {
  args: {
    text: 'Short',
    isFocusable: true,
    tooltipDelay: 0,
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const text = canvas.getByTestId('overflow-text');
    const body = within(canvasElement.ownerDocument.body);

    await expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth);
    await userEvent.tab();
    await expect(text).toHaveFocus();
    await userEvent.hover(text);
    await expect(body.queryByRole('tooltip')).not.toBeInTheDocument();
  },
};

export const MultilineOverflowing: Story = {
  args: {
    text: longText,
    lineClamp: 2,
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tooltip = await canvas.findByTestId('overflow-text');
    await userEvent.hover(tooltip);

    const canvasBody = within(canvasElement.ownerDocument.body);

    await expect(
      tooltip.scrollWidth > tooltip.clientWidth ||
        tooltip.scrollHeight > tooltip.clientHeight,
    ).toBe(true);
    const popup = await canvasBody.findByRole('tooltip');

    await waitFor(() => expect(popup).toBeVisible());
  },
};

export const MultilineNotOverflowing: Story = {
  args: {
    text: 'Short',
    lineClamp: 2,
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tooltip = await canvas.findByTestId('overflow-text');
    await userEvent.hover(tooltip);
  },
};

export const SingleLineWithReactNodeOverflowing: Story = {
  args: {
    text: (
      <>
        {longText} ·{' '}
        <Text render={<strong />} style={{ display: 'inline' }}>
          Secondary Label
        </Text>
      </>
    ),
    tooltipContent: `${longText} · Secondary Label`,
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tooltip = await canvas.findByTestId('overflow-text');
    await userEvent.hover(tooltip);

    const canvasBody = within(canvasElement.ownerDocument.body);

    await expect(
      tooltip.scrollWidth > tooltip.clientWidth ||
        tooltip.scrollHeight > tooltip.clientHeight,
    ).toBe(true);
    const popup = await canvasBody.findByRole('tooltip');

    await waitFor(() => expect(popup).toBeVisible());
  },
};

export const SingleLineWithReactNodeNotOverflowing: Story = {
  args: {
    text: (
      <>
        A ·{' '}
        <Text render={<strong />} style={{ display: 'inline' }}>
          B
        </Text>
      </>
    ),
    tooltipContent: 'A · B',
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tooltip = await canvas.findByTestId('overflow-text');
    await userEvent.hover(tooltip);
  },
};

export const MultilineWithReactNodeOverflowing: Story = {
  args: {
    text: (
      <>
        Hello!{' '}
        <Text render={<i />} style={{ display: 'inline' }}>
          {longText}
        </Text>{' '}
        ·{' '}
        <Text render={<strong />} style={{ display: 'inline' }}>
          Important Note
        </Text>
      </>
    ),
    tooltipContent: `Hello! ${longText} · Important Note`,
    lineClamp: 2,
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tooltip = await canvas.findByTestId('overflow-text');
    await userEvent.hover(tooltip);

    const canvasBody = within(canvasElement.ownerDocument.body);

    await expect(
      tooltip.scrollWidth > tooltip.clientWidth ||
        tooltip.scrollHeight > tooltip.clientHeight,
    ).toBe(true);
    const popup = await canvasBody.findByRole('tooltip');

    await waitFor(() => expect(popup).toBeVisible());
  },
};

export const MultilineWithReactNodeNotOverflowing: Story = {
  args: {
    text: (
      <>
        A ·{' '}
        <Text render={<strong />} style={{ display: 'inline' }}>
          B
        </Text>
      </>
    ),
    tooltipContent: 'A · B',
    lineClamp: 2,
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tooltip = await canvas.findByTestId('overflow-text');
    await userEvent.hover(tooltip);
  },
};

export const ExplicitLink: Story = {
  decorators: [ComponentDecorator],
  args: {
    text: 'https://twenty.com/developers/long-documentation-path',
    render: (
      <a
        href="https://twenty.com/developers/long-documentation-path"
        aria-label="Typography documentation"
      />
    ),
    style: { maxWidth: 200, display: 'block' },
    tooltipDelay: 0,
    title: 'Read documentation',
    onFocus: fn(),
    onPointerEnter: fn(),
    onClick: fn((event: MouseEvent<HTMLElement>) => event.preventDefault()),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');
    await expect(canvas.getAllByRole('link')).toHaveLength(1);
    await expect(link.scrollWidth).toBeGreaterThan(link.clientWidth);
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(args.onFocus).toHaveBeenCalledOnce();
    await expect(link).toHaveAttribute('title', 'Read documentation');
    const body = within(canvasElement.ownerDocument.body);
    const popup = await body.findByRole('tooltip');

    await waitFor(() => expect(popup).toBeVisible());
    await expect(popup).toHaveTextContent(link.textContent ?? '');
    await userEvent.click(link);
    await expect(args.onPointerEnter).toHaveBeenCalled();
    await expect(args.onClick).toHaveBeenCalledOnce();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
    await expect(link).toHaveFocus();
  },
};

export const Focusable: Story = {
  decorators: [ComponentDecorator],
  render: (args) => (
    <>
      <OverflowingTextWithTooltip
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...args}
        data-testid="overflow-text"
      />
      <Button>Next action</Button>
    </>
  ),
  args: {
    text: 'Clickable label',
    tooltipContent: 'Additional information',
    alwaysShowTooltip: true,
    isFocusable: true,
    tooltipDelay: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const text = canvas.getByTestId('overflow-text');
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.tab();
    await expect(text).toHaveFocus();
    const popup = await body.findByRole('tooltip');

    await waitFor(() => expect(popup).toBeVisible());
    await expect(popup).toHaveTextContent('Additional information');
    await userEvent.hover(text);
    await userEvent.unhover(text);
    await waitFor(() => expect(popup).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
    await expect(text).toHaveFocus();
    await userEvent.click(text);
    const reopenedPopup = await body.findByRole('tooltip');

    await waitFor(() => expect(reopenedPopup).toBeVisible());
    await expect(reopenedPopup).toHaveTextContent('Additional information');
    await expect(text).toHaveFocus();
    await userEvent.unhover(text);
    await waitFor(() => expect(reopenedPopup).toBeVisible());
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Next action' }),
    ).toHaveFocus();
    await waitFor(() =>
      expect(body.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
  },
};

export const Typography: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <Text
      size="xxl"
      weight="semibold"
      color="secondary"
      style={{ maxWidth: 220 }}
    >
      <OverflowingTextWithTooltip text="Inherited text" />
      <OverflowingTextWithTooltip
        text="Explicit typography with overflowing content"
        size="lg"
        weight="regular"
        color="primary"
        tooltipDelay={0}
        isFocusable
      />
    </Text>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inherited = canvas.getByText('Inherited text');
    const explicit = canvas.getByText(
      'Explicit typography with overflowing content',
    );
    const inheritedStyle = getComputedStyle(inherited);
    const explicitStyle = getComputedStyle(explicit);
    const rootFontSize = Number.parseFloat(
      getComputedStyle(canvasElement.ownerDocument.documentElement).fontSize,
    );

    await expect(Number.parseFloat(inheritedStyle.fontSize)).toBeCloseTo(
      rootFontSize * 1.85,
      1,
    );
    await expect(inheritedStyle.fontWeight).toBe('600');
    await expect(Number.parseFloat(explicitStyle.fontSize)).toBeCloseTo(
      rootFontSize * 1.23,
      1,
    );
    await expect(explicitStyle.fontWeight).toBe('400');
    await expect(explicit.scrollWidth).toBeGreaterThan(explicit.clientWidth);
    await userEvent.hover(explicit);

    const popup = await within(canvasElement.ownerDocument.body).findByRole(
      'tooltip',
    );

    await waitFor(() => expect(popup).toBeVisible());
    await expect(
      Number.parseFloat(getComputedStyle(popup).fontSize),
    ).toBeCloseTo(rootFontSize * 0.92, 1);
  },
};
