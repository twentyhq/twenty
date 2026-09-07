import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { IconInfoCircle } from '@ui/icon';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import {
  AppTooltip as Tooltip,
  TooltipDelay,
  TooltipPosition,
} from '../AppTooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Surfaces/Tooltip',
  component: Tooltip,
  args: {
    title: 'Amount',
    description: '',
    anchorSelect: '#tooltip-anchor',
    place: TooltipPosition.Bottom,
    delay: TooltipDelay.mediumDelay,
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    Icon: {
      control: 'select',
      options: ['None', 'Info'],
      mapping: { None: undefined, Info: IconInfoCircle },
    },
  },
  render: (args) => (
    <>
      <button type="button" id={args.anchorSelect?.slice(1)}>
        Hover or focus me
      </button>
      <Tooltip {...args} />
    </>
  ),
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  decorators: [ComponentDecorator],
};

export const WithArrow: Story = {
  args: { noArrow: false },
  decorators: [ComponentDecorator],
};

export const WithDescription: Story = {
  args: {
    description: 'The amount of this opportunity',
    delay: TooltipDelay.longDelay,
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));

    const tooltip = await within(canvasElement.ownerDocument.body).findByRole(
      'tooltip',
      undefined,
      { timeout: 5000 },
    );

    await waitFor(() => expect(tooltip).toBeVisible(), { timeout: 5000 });
    expect(within(tooltip).getByText('Amount')).toBeVisible();
    expect(
      within(tooltip).getByText('The amount of this opportunity'),
    ).toBeVisible();
  },
};

export const WithIcon: Story = {
  args: {
    description: 'The amount of this opportunity',
    Icon: IconInfoCircle,
  },
  decorators: [ComponentDecorator],
};

export const DescriptionOnly: Story = {
  args: { title: '', description: 'The amount of this opportunity' },
  decorators: [ComponentDecorator],
};

export const KeyboardFocus: Story = {
  args: WithDescription.args,
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    await userEvent.tab();

    expect(within(canvasElement).getByRole('button')).toHaveFocus();
    const tooltip = await within(canvasElement.ownerDocument.body).findByRole(
      'tooltip',
      undefined,
      { timeout: 5000 },
    );

    await waitFor(() => expect(tooltip).toBeVisible(), { timeout: 5000 });
  },
};

export const Hoverable: Story = {
  args: { interactive: true },
  decorators: [ComponentDecorator],
};

export const WithMaxWidth: Story = {
  args: {
    description:
      'A longer description that wraps naturally within the maximum tooltip width.',
    maxWidth: '200px',
  },
  decorators: [ComponentDecorator],
};

export const CustomContent: Story = {
  args: {
    title: undefined,
    description: undefined,
    children: (
      <span>
        <strong>Custom</strong> formatted content
      </span>
    ),
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof Tooltip> = {
  args: { isOpen: true },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'Content',
          values: [
            'title',
            'description',
            'icon',
            'description-only',
            'custom',
          ],
          props: (example: string) =>
            example === 'custom'
              ? {
                  anchorSelect: '#tooltip-custom',
                  title: undefined,
                  description: undefined,
                  Icon: undefined,
                  children: CustomContent.args?.children,
                }
              : {
                  anchorSelect: `#tooltip-${example}`,
                  title: example === 'description-only' ? '' : 'Amount',
                  description:
                    example === 'title' ? '' : 'The amount of this opportunity',
                  Icon: example === 'icon' ? IconInfoCircle : undefined,
                  children: undefined,
                },
        },
      ],
      options: { elementContainer: { style: { margin: '60px 30px' } } },
    },
  },
  decorators: [CatalogDecorator],
};
