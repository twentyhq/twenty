import { type Meta, type StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { OverflowingTextWithTooltip } from '../OverflowingTextWithTooltip';

const longText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tellus diam, rhoncus nec consequat quis, dapibus quis massa. Praesent tincidunt augue at ex bibendum, non finibus augue faucibus. In at gravida orci. Nulla facilisi. Proin ut augue ut nisi pellentesque tristique. Proin sodales libero id turpis tincidunt posuere. Sed euismod, nunc at aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nunc. Donec euismod, nunc quis aliquam ultricies, nunc nisl aliquet nunc.';

const meta: Meta<typeof OverflowingTextWithTooltip> = {
  title: 'UI/Display/Tooltip/OverflowingTextWithTooltip',
  component: OverflowingTextWithTooltip,
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
    const tooltip = await canvas.findByTestId('tooltip');
    await userEvent.hover(tooltip);
  },
};

export const SingleLineNotOverflowing: Story = {
  args: {
    text: 'Short',
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tooltip = await canvas.findByTestId('tooltip');
    await userEvent.hover(tooltip);
  },
};

export const MultilineOverflowing: Story = {
  args: {
    text: longText,
    displayedMaxRows: 2,
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tooltip = await canvas.findByTestId('tooltip');
    await userEvent.hover(tooltip);
  },
};

export const MultilineNotOverflowing: Story = {
  args: {
    text: 'Short',
    displayedMaxRows: 2,
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tooltip = await canvas.findByTestId('tooltip');
    await userEvent.hover(tooltip);
  },
};

export const SingleLineWithReactNodeOverflowing: Story = {
  args: {
    text: (
      <>
        {longText} · <strong>Secondary Label</strong>
      </>
    ),
    tooltipContent: `${longText} · Secondary Label`,
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tooltip = await canvas.findByTestId('tooltip');
    await userEvent.hover(tooltip);
  },
};

export const SingleLineWithReactNodeNotOverflowing: Story = {
  args: {
    text: (
      <>
        A · <strong>B</strong>
      </>
    ),
    tooltipContent: 'A · B',
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tooltip = await canvas.findByTestId('tooltip');
    await userEvent.hover(tooltip);
  },
};

export const MultilineWithReactNodeOverflowing: Story = {
  args: {
    text: (
      <>
        Hello! <i>{longText}</i> · <strong>Important Note</strong>
      </>
    ),
    tooltipContent: `Hello! ${longText} · Important Note`,
    displayedMaxRows: 2,
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tooltip = await canvas.findByTestId('tooltip');
    await userEvent.hover(tooltip);
  },
};

export const MultilineWithReactNodeNotOverflowing: Story = {
  args: {
    text: (
      <>
        A · <strong>B</strong>
      </>
    ),
    tooltipContent: 'A · B',
    displayedMaxRows: 2,
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tooltip = await canvas.findByTestId('tooltip');
    await userEvent.hover(tooltip);
  },
};
