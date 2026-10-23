import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Avatar } from '@ui/primitives/data-display/Avatar/Avatar';
import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  ComponentDecorator,
  type CatalogStory,
} from '@ui/testing';
import { themeCssVariables } from '@ui/theme';

import { ListItem } from '../ListItem';
import { type ListItemProps } from '../types/ListItemProps';
import { ListItemMultilineExample } from './ListItemMultilineExample';

const onEndAction = fn();

const meta: Meta<typeof ListItem> = {
  title: 'UI/Navigation/ListItem/Multiline',
  component: ListItem,
  parameters: { container: { width: 560 } },
  args: {
    children: 'Quarterly planning',
    description:
      'Review the proposed timeline and confirm the next steps with the team.',
    descriptionPlacement: 'below',
    startIcon: <Avatar name="Alex Morgan" size="md" imageProps={{ alt: '' }} />,
    endIcon: (
      <Text render={<span />} size="sm" color="secondary">
        09:48
      </Text>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof ListItem>;

export const Display: Story = { decorators: [ComponentDecorator] };

export const Narrow: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 240 } },
  args: {
    children: 'A quarterly planning document with a long title',
    description: 'planningdocumentswithaverylongunbrokensequence@example.com',
    actions: (
      <Button size="sm" variant="ghost">
        Review document
      </Button>
    ),
    actionsVisibility: 'always',
  },
};

export const NarrowControlInteractions: Story = {
  ...Narrow,
  tags: ['!autodocs'],
  args: {
    ...Narrow.args,
    endIcon: (
      <Button size="sm" variant="ghost">
        Details
      </Button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const details = canvas.getByRole('button', { name: 'Details' });
    const review = canvas.getByRole('button', { name: 'Review document' });
    const description = canvas.getByText(
      'planningdocumentswithaverylongunbrokensequence@example.com',
    );
    const row = details.closest<HTMLElement>('[data-description-placement]');

    await userEvent.tab();
    await expect(details).toHaveFocus();
    await userEvent.tab();
    await expect(review).toHaveFocus();
    await expect(review.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      description.getBoundingClientRect().bottom,
    );
    await expect(row?.scrollWidth).toBe(row?.clientWidth);
  },
};

export const EndActionInteractions: Story = {
  tags: ['!autodocs', '!dev'],
  decorators: [ComponentDecorator],
  parameters: { container: { width: 400 } },
  args: {
    render: <div role="group" aria-label="Planning document" />,
    onClick: fn(),
    actionsPlacement: 'end',
    children: (
      <Text
        render={<span />}
        style={{ display: 'block', lineHeight: themeCssVariables.spacing[4] }}
        truncate
      >
        Quarterly planning and the proposed timeline for every team
      </Text>
    ),
    description: (
      <Text
        render={<span />}
        style={{
          display: 'block',
          lineHeight: `calc(${themeCssVariables.spacing[4]} - ${themeCssVariables.spacing[0.5]})`,
        }}
        truncate
      >
        Review the proposed timeline and confirm the next steps with the team.
      </Text>
    ),
    actions: (
      <Button
        size="sm"
        variant="ghost"
        onClick={(event) => {
          event.stopPropagation();
          onEndAction();
        }}
      >
        Archive
      </Button>
    ),
  },
  play: async ({ canvasElement, args }) => {
    const { userEvent: trustedUserEvent } = await import('vitest/browser');
    const canvas = within(canvasElement);
    const row = canvas.getByRole('group', { name: 'Planning document' });
    const archive = canvas.getByRole('button', { name: 'Archive' });
    const title = canvas.getByText(
      'Quarterly planning and the proposed timeline for every team',
    );
    const description = canvas.getByText(
      'Review the proposed timeline and confirm the next steps with the team.',
    );
    await trustedUserEvent.unhover(row);
    const initialHeight = row.getBoundingClientRect().height;
    const initialTitleWidth = title.clientWidth;

    await trustedUserEvent.hover(row);
    await waitFor(() => expect(archive).toBeVisible());
    await expect(row.getBoundingClientRect().height).toBe(initialHeight);
    await expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth);
    await trustedUserEvent.unhover(row);
    await userEvent.tab();
    await expect(archive).toHaveFocus();
    await waitFor(() =>
      expect(archive.parentElement).toHaveStyle({ opacity: '1' }),
    );
    await expect(row.getBoundingClientRect().height).toBe(initialHeight);
    await expect(archive.getBoundingClientRect().top).toBeLessThan(
      description.getBoundingClientRect().bottom,
    );
    await expect(title.clientWidth).toBeLessThan(initialTitleWidth);
    await expect(title).toHaveStyle({ textOverflow: 'ellipsis' });
    await expect(description).toHaveStyle({ textOverflow: 'ellipsis' });
    await expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth);
    await userEvent.keyboard('{Enter}');
    await expect(onEndAction).toHaveBeenCalledTimes(1);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const TruncatedDescription: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 240 } },
  args: {
    description: (
      <Text render={<span />} style={{ display: 'block' }} truncate>
        Review the proposed timeline and confirm the next steps with the team.
      </Text>
    ),
  },
};

export const IndependentControls: Story = {
  decorators: [ComponentDecorator],
  render: () => <ListItemMultilineExample />,
};

export const IndependentControlInteractions: StoryObj<
  typeof ListItemMultilineExample
> = {
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  args: { onOpen: fn(), onArchive: fn() },
  render: (args) => (
    <ListItemMultilineExample onOpen={args.onOpen} onArchive={args.onArchive} />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole('group', { name: 'Planning document' });
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Select planning document',
    });
    const open = canvas.getByRole('button', { name: 'Quarterly planning' });
    const archive = canvas.getByRole('button', { name: 'Archive' });

    await userEvent.tab();
    await expect(checkbox).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(checkbox).toBeChecked();
    await expect(row).toHaveAttribute('data-selected');
    await expect(row).not.toHaveAttribute('data-active');
    await expect(args.onOpen).not.toHaveBeenCalled();
    await expect(args.onArchive).not.toHaveBeenCalled();

    await userEvent.tab();
    await expect(open).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(row).toHaveAttribute('data-active');
    await expect(checkbox).toBeChecked();
    await expect(args.onOpen).toHaveBeenCalledTimes(1);

    await userEvent.tab();
    await expect(archive).toHaveFocus();
    await waitFor(() =>
      expect(archive.parentElement).toHaveStyle({ opacity: '1' }),
    );
    await userEvent.keyboard(' ');
    await expect(open).toHaveAttribute('aria-pressed', 'true');
    await expect(args.onArchive).toHaveBeenCalledTimes(1);
    await expect(args.onOpen).toHaveBeenCalledTimes(1);
    await expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);
    await expect(row).not.toHaveAttribute('data-selected');
    await expect(row).toHaveAttribute('data-active');
    await expect(checkbox).not.toBeChecked();
  },
};

export const HighlightedWithoutKeyboardFocus: Story = {
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  args: { focused: true, render: <button type="button" /> },
  play: async ({ canvasElement }) => {
    const item = within(canvasElement).getByRole('button');

    await userEvent.hover(item);
    await expect(item).toHaveAttribute('data-highlighted');
    await expect(item).not.toHaveFocus();
    await expect(item).toHaveStyle({ outlineStyle: 'none' });

    await userEvent.tab();
    await expect(item).toHaveFocus();
    await expect(item).toHaveStyle({ outlineStyle: 'solid' });
  },
};

export const DisabledControls: Story = {
  decorators: [ComponentDecorator],
  render: () => <ListItemMultilineExample disabled />,
};

export const DisabledControlInteractions: Story = {
  ...DisabledControls,
  tags: ['!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox');
    const open = canvas.getByRole('button', { name: 'Quarterly planning' });
    const archive = canvas.getByRole('button', { name: 'Archive' });

    await expect(checkbox).toHaveAttribute('aria-disabled', 'true');
    await expect(open).toBeDisabled();
    await expect(archive).toBeDisabled();
    await userEvent.click(open);
    await userEvent.click(checkbox);
    await expect(open).toHaveAttribute('aria-pressed', 'false');
    await expect(checkbox).not.toBeChecked();
  },
};

type MultilineState =
  | 'default'
  | 'active'
  | 'selected'
  | 'focused'
  | 'combined'
  | 'disabled';

const MULTILINE_STATE_PROPS: Record<MultilineState, Partial<ListItemProps>> = {
  default: {},
  active: { active: true },
  selected: { selected: true },
  focused: { focused: true },
  combined: { active: true, selected: true, focused: true },
  disabled: { disabled: true },
};

export const VisualRegression: CatalogStory<Story, typeof ListItem> = {
  tags: ['!autodocs'],
  decorators: [CatalogDecorator],
  args: {
    indicator: 'checkbox',
    startIcon: undefined,
    selectionAppearance: 'accent',
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        { name: '', values: [''], props: () => ({}) },
        {
          name: 'state',
          values: [
            'default',
            'active',
            'selected',
            'focused',
            'combined',
            'disabled',
          ] satisfies MultilineState[],
          props: (state: MultilineState) => MULTILINE_STATE_PROPS[state],
        },
      ],
      options: { elementContainer: { style: { width: 320 } } },
    },
  },
};

export const VisualRegressionDark: CatalogStory<Story, typeof ListItem> = {
  ...VisualRegression,
  globals: { colorScheme: 'dark' },
};

export const SelectionAppearance: CatalogStory<Story, typeof ListItem> = {
  decorators: [CatalogDecorator],
  args: {
    selected: true,
    indicator: 'checkbox',
    startIcon: undefined,
    description: 'Team planning',
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'selection appearance',
          values: ['default', 'accent'] satisfies NonNullable<
            ListItemProps['selectionAppearance']
          >[],
          props: (
            selectionAppearance: ListItemProps['selectionAppearance'],
          ) => ({ selectionAppearance }),
        },
        {
          name: 'description placement',
          values: ['inline', 'end', 'below'] satisfies NonNullable<
            ListItemProps['descriptionPlacement']
          >[],
          props: (
            descriptionPlacement: ListItemProps['descriptionPlacement'],
          ) => ({ descriptionPlacement }),
        },
      ],
      options: { elementContainer: { style: { width: 320 } } },
    },
  },
};

export const SelectionAppearanceInteractions: CatalogStory<
  Story,
  typeof ListItem
> = {
  ...SelectionAppearance,
  tags: ['!autodocs'],
  render: (args) => (
    <ListItem
      role="group"
      aria-label={`${args.descriptionPlacement} ${args.selectionAppearance}`}
      selected
      selectionAppearance={args.selectionAppearance}
      descriptionPlacement={args.descriptionPlacement}
      description="Supporting content"
      indicator="checkbox"
    >
      Quarterly planning
    </ListItem>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const accentBackground = getComputedStyle(
      canvas.getByRole('group', { name: 'inline accent' }),
    ).backgroundColor;
    const defaultBackground = getComputedStyle(
      canvas.getByRole('group', { name: 'inline default' }),
    ).backgroundColor;

    await expect(accentBackground).not.toBe(defaultBackground);

    for (const placement of ['inline', 'end', 'below']) {
      await expect(
        canvas.getByRole('group', { name: `${placement} accent` }),
      ).toHaveStyle({ backgroundColor: accentBackground });
      await expect(
        canvas.getByRole('group', { name: `${placement} default` }),
      ).toHaveStyle({ backgroundColor: defaultBackground });
    }
  },
};
