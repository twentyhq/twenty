import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

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

export const SingleLineOverflowingDocumentation: Story = {
  args: SingleLineOverflowing.args,
  decorators: SingleLineOverflowing.decorators,
};

export const SingleLineNotOverflowing: Story = {
  args: {
    text: 'Short',
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tooltip = await canvas.findByTestId('overflow-text');
    await userEvent.hover(tooltip);
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
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');
    await expect(canvas.getAllByRole('link')).toHaveLength(1);
    await expect(link.scrollWidth).toBeGreaterThan(link.clientWidth);
    await userEvent.tab();
    await expect(link).toHaveFocus();
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole('tooltip')).toHaveTextContent(
      link.textContent ?? '',
    );
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
      <OverflowingTextWithTooltip {...args} data-testid="overflow-text" />
      <Button>Next action</Button>
    </>
  ),
  args: { text: longText, isFocusable: true, tooltipDelay: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const text = canvas.getByTestId('overflow-text');
    await userEvent.tab();
    await expect(text).toHaveFocus();
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole('tooltip')).toHaveTextContent(longText);
    await userEvent.hover(text);
    await userEvent.unhover(text);
    await waitFor(() => expect(body.getByRole('tooltip')).toBeVisible());
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Next action' }),
    ).toHaveFocus();
    await waitFor(() =>
      expect(body.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
  },
};
