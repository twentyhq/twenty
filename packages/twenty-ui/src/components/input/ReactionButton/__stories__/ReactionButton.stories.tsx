import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Tooltip } from '@ui/primitives/surfaces/Tooltip/Tooltip';
import { Text } from '@ui/primitives/typography/Text/Text';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
  GroupedCatalog,
} from '@ui/testing';

import { ReactionButton } from '../ReactionButton';
import { type ReactionButtonProps } from '../types/ReactionButtonProps';
import { ReactionButtonExample } from './ReactionButtonExample';

const meta: Meta<typeof ReactionButton> = {
  id: 'ui-components-reactionbutton',
  title: 'UI/Components/Input/ReactionButton',
  component: ReactionButton,
  decorators: [ComponentDecorator],
  args: {
    emoji: '👍',
    count: 2,
    pressed: false,
    'aria-label': 'Helpful',
    onPressedChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ReactionButton>;

export const Display: Story = {
  argTypes: {
    count: { control: false },
    pressed: { control: false },
    'aria-label': { control: false },
  },
  render: ({ emoji, disabled, loading }) => (
    <ReactionButtonExample
      emoji={emoji}
      disabled={disabled}
      loading={loading}
    />
  ),
};

const REACTION_STATES: {
  label: string;
  props: Partial<ReactionButtonProps>;
}[] = [
  { label: 'Unselected', props: {} },
  { label: 'Selected', props: { pressed: true, count: 3 } },
  { label: 'Disabled', props: { disabled: true } },
  { label: 'Loading', props: { pressed: true, loading: true } },
  { label: 'Zero', props: { count: 0 } },
  { label: 'Formatted count', props: { count: '1,234' } },
];

export const Catalog: Story = {
  parameters: { container: { width: 540 } },
  render: (args) => (
    <GroupedCatalog
      groups={[{ label: 'States and counts', examples: REACTION_STATES }]}
      renderExample={({ label, props }) => (
        <>
          <Text>{label}</Text>
          <ReactionButton
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...args}
            pressed={props.pressed ?? args.pressed}
            count={props.count ?? args.count}
            disabled={props.disabled}
            loading={props.loading}
          />
        </>
      )}
    />
  ),
};

export const Keyboard: Story = {
  ...Display,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reaction = canvas.getByRole('button', { name: 'Helpful' });

    reaction.focus();
    await expect(reaction).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(reaction).toHaveAttribute('aria-pressed', 'true');
    await expect(reaction).toHaveTextContent('3');
    await userEvent.keyboard(' ');
    await expect(reaction).toHaveAttribute('aria-pressed', 'false');
    await expect(reaction).toHaveTextContent('2');
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Reset' })).toHaveFocus();
  },
};

export const ControlledRequest: Story = {
  args: { onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const reaction = within(canvasElement).getByRole('button');

    await userEvent.click(reaction);
    await expect(args.onClick).toHaveBeenCalledOnce();
    await expect(args.onPressedChange).toHaveBeenCalledOnce();
    await expect(args.onPressedChange).toHaveBeenCalledWith(true);
    await expect(reaction).toHaveAttribute('aria-pressed', 'false');
    await expect(reaction).toHaveTextContent('2');
  },
};

export const CancelledRequest: Story = {
  args: { onClick: fn((event) => event.preventDefault()) },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));
    await expect(args.onClick).toHaveBeenCalledOnce();
    await expect(args.onPressedChange).not.toHaveBeenCalled();
  },
};

export const Disabled: Story = {
  args: { disabled: true, onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const reaction = within(canvasElement).getByRole('button');

    await expect(reaction).toBeDisabled();
    await userEvent.click(reaction);
    await expect(args.onClick).not.toHaveBeenCalled();
    await expect(args.onPressedChange).not.toHaveBeenCalled();
  },
};

export const PendingMutation: Story = {
  args: { pressed: true, loading: true },
  play: async ({ canvasElement, args }) => {
    const reaction = within(canvasElement).getByRole('button');

    await expect(reaction).toHaveAttribute('aria-busy', 'true');
    await expect(reaction).toHaveAttribute('aria-pressed', 'true');
    await expect(reaction).toBeDisabled();
    await userEvent.click(reaction);
    await expect(args.onPressedChange).not.toHaveBeenCalled();
  },
};

export const LongAccessibleLabel: Story = {
  args: {
    'aria-label':
      'Celebration, 24 reactions from teammates across the design, engineering, and customer support teams',
    emoji: '🎉',
    count: 24,
    pressed: true,
  },
  render: (args) => (
    <Tooltip content={args['aria-label']} delay={0}>
      <ReactionButton
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...args}
      />
    </Tooltip>
  ),
  play: async ({ canvasElement, args }) => {
    const reaction = within(canvasElement).getByRole('button', {
      name: args['aria-label'],
    });
    const body = within(canvasElement.ownerDocument.body);

    reaction.focus();
    await expect(await body.findByRole('tooltip')).toHaveTextContent(
      args['aria-label'] ?? '',
    );
    await expect(reaction.getBoundingClientRect().height).toBe(24);
    await expect(reaction.getBoundingClientRect().width).toBeLessThan(80);
    await userEvent.keyboard('{Enter}');
    await expect(args.onPressedChange).toHaveBeenCalledOnce();
    await expect(args.onPressedChange).toHaveBeenCalledWith(false);
  },
};

export const VisualRegression: CatalogStory<Story, typeof ReactionButton> = {
  tags: ['!autodocs'],
  decorators: [CatalogDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'state',
          values: REACTION_STATES.map(({ label }) => label),
          props: (state: string) =>
            REACTION_STATES.find(({ label }) => label === state)?.props ?? {},
        },
      ],
      options: { elementContainer: { style: { width: 100 } } },
    },
  },
};

export const VisualRegressionDark: CatalogStory<Story, typeof ReactionButton> =
  {
    ...VisualRegression,
    globals: { colorScheme: 'dark' },
  };
