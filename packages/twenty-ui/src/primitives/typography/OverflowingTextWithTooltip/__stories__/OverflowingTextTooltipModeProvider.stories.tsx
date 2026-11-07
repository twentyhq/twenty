import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';

import {
  OverflowingTextTooltipModeProvider,
  OverflowingTextWithTooltip,
  Text,
} from '@ui/primitives/typography';
import { ComponentDecorator } from '@ui/testing';

const meta: Meta<typeof OverflowingTextTooltipModeProvider> = {
  title: 'UI/Typography/OverflowingTextTooltipModeProvider',
  component: OverflowingTextTooltipModeProvider,
  decorators: [ComponentDecorator],
  args: { mode: 'measure-on-hover' },
  argTypes: {
    children: { control: false, table: { disable: true } },
    mode: {
      control: 'select',
      options: ['measure-on-hover', 'measure-on-open', 'disabled'],
    },
  },
  render: ({ mode }) => (
    <OverflowingTextTooltipModeProvider mode={mode}>
      <Text style={{ maxWidth: 220 }}>
        <OverflowingTextWithTooltip
          text="Quarterly account review and renewal preparation"
          isFocusable
        />
      </Text>
    </OverflowingTextTooltipModeProvider>
  ),
};

export default meta;
type Story = StoryObj<typeof OverflowingTextTooltipModeProvider>;

export const Display: Story = {};

export const Disabled: Story = { args: { mode: 'disabled' } };

export const DisabledInteractions: Story = {
  args: { mode: 'disabled' },
  render: ({ mode }) => (
    <OverflowingTextTooltipModeProvider mode={mode}>
      <Text style={{ maxWidth: 220 }}>
        <OverflowingTextWithTooltip
          text="Quarterly account review and renewal preparation"
          alwaysShowTooltip
          isFocusable
          tooltipDelay={0}
        />
      </Text>
    </OverflowingTextTooltipModeProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const text = canvas.getByText(
      'Quarterly account review and renewal preparation',
    );
    const body = within(canvasElement.ownerDocument.body);

    await expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
    await userEvent.hover(text);
    await userEvent.tab();
    await expect(text).toHaveFocus();
    await expect(body.queryByRole('tooltip')).not.toBeInTheDocument();
  },
};

export const MeasureOnOpen: Story = {
  args: { mode: 'measure-on-open' },
  render: function Render({ mode }) {
    const [text, setText] = useState('Short label');

    return (
      <OverflowingTextTooltipModeProvider mode={mode}>
        <Text style={{ maxWidth: 220 }}>
          <OverflowingTextWithTooltip text={text} tooltipDelay={0} />
          <Button
            onClick={() =>
              setText('Quarterly account review and renewal preparation')
            }
          >
            Expand label
          </Button>
        </Text>
      </OverflowingTextTooltipModeProvider>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const text = canvas.getByText('Short label');
    const body = within(canvasElement.ownerDocument.body);

    await expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth);
    await userEvent.hover(text);
    await expect(body.queryByRole('tooltip')).not.toBeInTheDocument();
    await userEvent.unhover(text);
    await userEvent.click(canvas.getByRole('button', { name: 'Expand label' }));
    await waitFor(() =>
      expect(text.scrollWidth).toBeGreaterThan(text.clientWidth),
    );
    await expect(text).toHaveTextContent(
      'Quarterly account review and renewal preparation',
    );
    await expect(text).not.toHaveAttribute('data-content-overflowing');
    await fireEvent.mouseEnter(text);
    await fireEvent.mouseMove(text);
    const popup = await body.findByRole('tooltip');

    await waitFor(() => expect(popup).toBeVisible());
    await expect(popup).toHaveTextContent(
      'Quarterly account review and renewal preparation',
    );
  },
};
