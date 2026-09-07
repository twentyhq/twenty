import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

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

const CUSTOM_CONTENT = (
  <span>
    <strong>Custom</strong> formatted content
  </span>
);

const findTooltip = async (canvasElement: HTMLElement) => {
  const tooltip = await within(canvasElement.ownerDocument.body).findByRole(
    'tooltip',
    undefined,
    { timeout: 5000 },
  );

  await waitFor(() => expect(tooltip).toBeVisible(), { timeout: 5000 });

  return tooltip;
};

const onCustomActionClick = fn();

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
  play: async ({ canvasElement, args }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));

    const tooltip = await findTooltip(canvasElement);

    expect(tooltip.parentElement).toHaveStyle({
      maxWidth: args.maxWidth ?? '300px',
    });
    if (args.title) {
      expect(within(tooltip).getByText(args.title)).toBeVisible();
    }
    if (args.description) {
      expect(within(tooltip).getByText(args.description)).toBeVisible();
    }
    if (args.Icon) {
      expect(tooltip.querySelector('svg')).toHaveAttribute(
        'aria-hidden',
        'true',
      );
    }
    expect(
      tooltip.querySelector(':scope > [aria-hidden="true"]') !== null,
    ).toBe(args.noArrow === false);
  },
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

    expect(
      within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
    ).not.toBeInTheDocument();

    const tooltip = await findTooltip(canvasElement);
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
  args: {
    description: 'The amount of this opportunity',
    delay: TooltipDelay.longDelay,
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    await userEvent.tab();

    expect(within(canvasElement).getByRole('button')).toHaveFocus();
    const tooltip = await findTooltip(canvasElement);

    expect(tooltip).toHaveTextContent('The amount of this opportunity');

    await userEvent.tab();

    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
      ).not.toBeInTheDocument(),
    );
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
    children: CUSTOM_CONTENT,
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));

    expect(await findTooltip(canvasElement)).toHaveTextContent(
      'Custom formatted content',
    );
  },
};

export const InteractiveCustomContent: Story = {
  args: {
    title: undefined,
    description: undefined,
    interactive: true,
    children: (
      <button type="button" onClick={onCustomActionClick}>
        Show more
      </button>
    ),
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));

    const tooltip = await findTooltip(canvasElement);

    await userEvent.hover(tooltip);
    await userEvent.click(
      within(tooltip).getByRole('button', { name: 'Show more' }),
    );
    expect(onCustomActionClick).toHaveBeenCalledTimes(1);
    expect(tooltip).toBeVisible();

    await userEvent.unhover(tooltip);

    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
      ).not.toBeInTheDocument(),
    );
  },
};

export const LongTitle: Story = {
  args: {
    title: 'LongUnbrokenFieldName'.repeat(10),
    Icon: IconInfoCircle,
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));

    const tooltip = await findTooltip(canvasElement);

    expect(tooltip.scrollWidth).toBeLessThanOrEqual(tooltip.clientWidth);
    expect(tooltip.getBoundingClientRect().width).toBeLessThanOrEqual(300);
  },
};

export const Hidden: Story = {
  args: { hidden: true, isOpen: true },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));

    expect(
      within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
    ).not.toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: { title: '', description: '', Icon: IconInfoCircle, isOpen: true },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));

    expect(
      within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
    ).not.toBeInTheDocument();
  },
};

export const Catalog: CatalogStory<Story, typeof Tooltip> = {
  args: { isOpen: true },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await waitFor(() => expect(body.getAllByRole('tooltip')).toHaveLength(5));

    for (const tooltip of body.getAllByRole('tooltip')) {
      await waitFor(() => expect(tooltip).toBeVisible());
    }
  },
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
                  children: CUSTOM_CONTENT,
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
