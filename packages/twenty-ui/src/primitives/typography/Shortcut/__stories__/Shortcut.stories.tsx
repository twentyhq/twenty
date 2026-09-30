import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Button } from '@ui/primitives/input';
import { ListItem } from '@ui/primitives/navigation';
import { Shortcut, formatShortcut } from '@ui/primitives/typography';
import { ComponentDecorator, overrideMediaQueryMatches } from '@ui/testing';
import { MOBILE_MEDIA_QUERY } from '@ui/utilities';

const meta: Meta<typeof Shortcut> = {
  title: 'UI/Typography/Shortcut',
  component: Shortcut,
  decorators: [ComponentDecorator],
  args: {
    shortcut: { type: 'combination', keys: ['Mod', 'K'] },
    platform: 'mac',
  },
};

export default meta;
type Story = StoryObj<typeof Shortcut>;

export const Combination: Story = {
  play: async ({ canvasElement, args }) => {
    const shortcut = within(canvasElement).getByRole('img', {
      name: 'Command + K',
    });
    await expect(shortcut).toHaveTextContent(formatShortcut(args));
    await expect(shortcut).not.toHaveTextContent('then');
  },
};

export const OtherPlatform: Story = {
  args: { platform: 'other' },
  play: async ({ canvasElement, args }) => {
    const shortcut = within(canvasElement).getByRole('img', {
      name: 'Control + K',
    });
    await expect(shortcut).toHaveTextContent(formatShortcut(args));
  },
};

export const Sequence: Story = {
  args: { shortcut: { type: 'sequence', steps: [['G'], ['P']] } },
  play: async ({ canvasElement, args }) => {
    await expect(
      within(canvasElement).getByRole('img', { name: 'G then P' }),
    ).toHaveTextContent(formatShortcut(args));
  },
};

export const LocalizedSequence: Story = {
  args: {
    shortcut: {
      type: 'sequence',
      steps: [
        ['Control', 'K'],
        ['Control', 'C'],
      ],
    },
    platform: 'other',
    sequenceJoinLabel: 'followed by',
    'aria-label': 'Control K followed by Control C',
  },
  play: async ({ canvasElement, args }) => {
    await expect(
      within(canvasElement).getByRole('img', { name: args['aria-label'] }),
    ).toHaveTextContent(formatShortcut(args));
  },
};

export const Presentations: Story = {
  render: () => (
    <>
      <Button shortcut={{ type: 'combination', keys: ['Mod', 'Enter'] }}>
        Save record
      </Button>
      <ListItem
        shortcut={{ type: 'sequence', steps: [['G'], ['P']] }}
        shortcutJoinLabel="next"
      >
        Open people
      </ListItem>
      <Shortcut
        shortcut={{ type: 'combination', keys: ['Mod', 'K'] }}
        variant="text"
      />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Save record' }),
    ).toBeVisible();
    await expect(canvas.getByRole('img', { name: 'G next P' })).toBeVisible();
  },
};

export const Mobile: Story = {
  beforeEach: () => overrideMediaQueryMatches({ [MOBILE_MEDIA_QUERY]: true }),
  render: () => (
    <>
      <Shortcut
        shortcut={{ type: 'combination', keys: ['H'] }}
        visibility="desktop"
      />
      <Shortcut shortcut={{ type: 'combination', keys: ['V'] }} />
      <Button shortcut={{ type: 'combination', keys: ['S'] }}>Save</Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByRole('img', { name: 'H' }),
    ).not.toBeInTheDocument();
    await expect(canvas.getByRole('img', { name: 'V' })).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Save' }),
    ).toHaveTextContent(/^Save$/);
  },
};

export const Documentation: Story = {
  render: () => (
    <>
      <Button shortcut={{ type: 'combination', keys: ['Mod', 'Enter'] }}>
        Save record
      </Button>
      <ListItem
        shortcut={{ type: 'sequence', steps: [['G'], ['P']] }}
        shortcutJoinLabel="next"
      >
        Open people
      </ListItem>
      <Shortcut
        shortcut={{ type: 'combination', keys: ['Mod', 'K'] }}
        variant="text"
      />
    </>
  ),
};
