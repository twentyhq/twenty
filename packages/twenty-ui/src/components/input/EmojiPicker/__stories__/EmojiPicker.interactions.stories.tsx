import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { EmojiPickerExample } from './EmojiPickerExample';
import { mockEmojiPickerStoryData } from './mockEmojiPickerStoryData';

const meta: Meta<typeof EmojiPickerExample> = {
  id: 'ui-input-emojipicker-interactions',
  title: 'UI/Components/Input/EmojiPicker/Interactions',
  component: EmojiPickerExample,
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  beforeEach: () => mockEmojiPickerStoryData(),
  args: { onEmojiSelect: fn() },
};

export default meta;
type Story = StoryObj<typeof EmojiPickerExample>;

export const SearchAndPointerSelection: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole('searchbox', { name: 'Search emojis' });

    const firstEmoji = await canvas.findByRole('gridcell', {
      name: 'Thumbs up',
    });

    await expect(firstEmoji).toHaveAttribute('aria-colindex', '1');
    await expect(firstEmoji.closest('[role="row"]')).toHaveAttribute(
      'aria-rowindex',
      '1',
    );
    await userEvent.type(search, 'celebrate');
    await waitFor(() =>
      expect(
        canvas.queryByRole('gridcell', { name: 'Thumbs up' }),
      ).not.toBeInTheDocument(),
    );
    const partyPopper = canvas.getByRole('gridcell', { name: 'Party popper' });
    await userEvent.click(partyPopper);
    await expect(args.onEmojiSelect).toHaveBeenCalledOnce();
    await expect(args.onEmojiSelect).toHaveBeenCalledWith('🎉');
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Selected emoji: 🎉',
    );
  },
};

export const KeyboardSelection: Story = {
  args: { autoFocus: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole('searchbox', { name: 'Search emojis' });

    await expect(search).toHaveFocus();
    await canvas.findByRole('gridcell', { name: 'Thumbs up' });
    await userEvent.type(search, 'eyes');
    await waitFor(() =>
      expect(
        canvas.queryByRole('gridcell', { name: 'Thumbs up' }),
      ).not.toBeInTheDocument(),
    );
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(args.onEmojiSelect).toHaveBeenCalledOnce();
    await expect(args.onEmojiSelect).toHaveBeenCalledWith('👀');
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Selected emoji: 👀',
    );
  },
};

export const EmptyResultsAndLabels: Story = {
  args: {
    searchLabel: 'Find a reaction',
    searchPlaceholder: 'Search by name',
    loadingLabel: 'Preparing reactions',
    emptyLabel: 'No matching reactions',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole('searchbox', { name: 'Find a reaction' });

    await expect(search).toHaveAttribute('placeholder', 'Search by name');
    await canvas.findByRole('gridcell', { name: 'Thumbs up' });
    await userEvent.type(search, 'unknown-reaction');
    await expect(
      await canvas.findByText('No matching reactions'),
    ).toBeVisible();
    await expect(canvas.queryAllByRole('gridcell')).toHaveLength(0);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(args.onEmojiSelect).not.toHaveBeenCalled();
  },
};
