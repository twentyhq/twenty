import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Tooltip } from '@ui/primitives/surfaces/Tooltip/Tooltip';
import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator } from '@ui/testing';

import { OverflowingTextWithTooltip } from '../OverflowingTextWithTooltip';

const LONG_LABEL =
  'Quarterly account review and renewal preparation for the current workspace';

const meta: Meta<typeof OverflowingTextWithTooltip> = {
  title: 'UI/Surfaces/OverflowingTextWithTooltip/Interactions',
  component: OverflowingTextWithTooltip,
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  args: { style: { maxWidth: 200 } },
  render: (args) => (
    <OverflowingTextWithTooltip
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...args}
      data-testid="overflow-text"
    />
  ),
};

export default meta;
type Story = StoryObj<typeof OverflowingTextWithTooltip>;

export const ExplicitChildLink: Story = {
  args: {
    text: (
      <Text render={<a href="https://twenty.com" aria-label="Documentation" />}>
        Documentation
      </Text>
    ),
    tooltipContent: 'Open the documentation',
    alwaysShowTooltip: true,
    tooltipDelay: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const text = canvas.getByTestId('overflow-text');
    const link = canvas.getByRole('link', { name: 'Documentation' });
    const body = within(canvasElement.ownerDocument.body);

    await expect(text).not.toHaveAttribute('tabindex');
    await userEvent.tab();
    await expect(link).toHaveFocus();
    const popup = await body.findByRole('tooltip');

    await waitFor(() => expect(popup).toBeVisible());
    await expect(popup).toHaveTextContent('Open the documentation');
    await userEvent.hover(link);
    await userEvent.unhover(link);
    await waitFor(() => expect(popup).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
    await expect(link).toHaveFocus();
  },
};

export const CallerTabIndex: Story = {
  args: {
    text: 'Keyboard label',
    tabIndex: 0,
    alwaysShowTooltip: true,
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
    await expect(popup).toHaveTextContent('Keyboard label');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
  },
};

export const EmptyTooltipLabel: Story = {
  args: {
    text: <Text render={<span />}>Value</Text>,
    tooltipContent: '',
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
    await userEvent.hover(text);
    await expect(body.queryByRole('tooltip')).not.toBeInTheDocument();
  },
};

export const NestedTooltipPriority: Story = {
  render: () => (
    <Text
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: 'var(--t-spacing-2)',
        width: 200,
      }}
    >
      <Tooltip content="Field label" delay={0}>
        <Text>
          <OverflowingTextWithTooltip text="Short value" tooltipDelay={0} />
        </Text>
      </Tooltip>
      <Tooltip content="Field label" delay={0}>
        <Text>
          <OverflowingTextWithTooltip text={LONG_LABEL} tooltipDelay={0} />
        </Text>
      </Tooltip>
    </Text>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const shortValue = canvas.getByText('Short value');
    const longValue = canvas.getByText(LONG_LABEL);
    const body = within(canvasElement.ownerDocument.body);

    await expect(shortValue.scrollWidth).toBeLessThanOrEqual(
      shortValue.clientWidth,
    );
    await userEvent.hover(shortValue);
    const parentPopup = await body.findByRole('tooltip');

    await waitFor(() => expect(parentPopup).toBeVisible());
    await expect(parentPopup).toHaveTextContent('Field label');
    await userEvent.unhover(shortValue);
    await waitFor(() =>
      expect(body.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
    await expect(longValue.scrollWidth).toBeGreaterThan(longValue.clientWidth);
    await userEvent.hover(longValue);
    const nestedPopup = await body.findByRole('tooltip');

    await waitFor(() => expect(nestedPopup).toBeVisible());
    await expect(nestedPopup).toHaveTextContent(LONG_LABEL);
    await expect(body.getAllByRole('tooltip')).toHaveLength(1);
  },
};
