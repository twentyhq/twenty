import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { EmojiPickerExample } from './EmojiPickerExample';
import { type EMOJI_PICKER_STORY_DATA } from './emojiPickerStoryData';
import { mockEmojiPickerStoryData } from './mockEmojiPickerStoryData';

const EMOJI_PICKER_SCROLL_STORY_EMOJIBASE_URL = '/emoji-picker-scroll-story';
const EMOJI_PICKER_SCROLL_STORY_EMOJI_COUNT = 80;
const EMOJI_PICKER_SCROLL_STORY_FIRST_EMOJI_CODE_POINT = 0x1f600;
const EMOJI_PICKER_SCROLL_STORY_ACTIVE_ROW_LABELS = [
  'Reaction 9',
  'Reaction 17',
  'Reaction 25',
  'Reaction 33',
  'Reaction 41',
  'Reaction 49',
  'Reaction 57',
  'Reaction 65',
  'Reaction 73',
];
const EMOJI_PICKER_SCROLL_STORY_EMOJIS: typeof EMOJI_PICKER_STORY_DATA.emojis =
  [];

for (const index of new Array<number>(
  EMOJI_PICKER_SCROLL_STORY_EMOJI_COUNT,
).keys()) {
  const codePoint = EMOJI_PICKER_SCROLL_STORY_FIRST_EMOJI_CODE_POINT + index;

  EMOJI_PICKER_SCROLL_STORY_EMOJIS.push({
    emoji: String.fromCodePoint(codePoint),
    label: `reaction ${index + 1}`,
    hexcode: codePoint.toString(16).toUpperCase(),
    group: 1,
    subgroup: 19,
    version: 1,
    type: 1,
    order: index,
    text: '',
    tags: ['reaction'],
  });
}

const meta: Meta<typeof EmojiPickerExample> = {
  id: 'ui-input-emojipicker-scrolling',
  title: 'UI/Components/Input/EmojiPicker/Scrolling',
  component: EmojiPickerExample,
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  beforeEach: () =>
    mockEmojiPickerStoryData({
      emojibaseUrl: EMOJI_PICKER_SCROLL_STORY_EMOJIBASE_URL,
      emojis: EMOJI_PICKER_SCROLL_STORY_EMOJIS,
    }),
  args: {
    emojibaseUrl: EMOJI_PICKER_SCROLL_STORY_EMOJIBASE_URL,
    onEmojiSelect: fn(),
    autoFocus: true,
  },
};

export default meta;
type Story = StoryObj<typeof EmojiPickerExample>;

export const KeyboardScrollsActiveRowIntoView: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole('searchbox', { name: 'Search emojis' });

    const firstEmoji = await canvas.findByRole('gridcell', {
      name: 'Reaction 1',
    });

    await userEvent.click(search);
    await expect(search).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() =>
      expect(firstEmoji).toHaveAttribute('aria-selected', 'true'),
    );

    for (const name of EMOJI_PICKER_SCROLL_STORY_ACTIVE_ROW_LABELS) {
      await userEvent.keyboard('{ArrowDown}');
      const activeEmoji = await canvas.findByRole('gridcell', { name });

      await waitFor(() =>
        expect(activeEmoji).toHaveAttribute('aria-selected', 'true'),
      );
    }
    const lastRowFirstEmoji = await canvas.findByRole('gridcell', {
      name: 'Reaction 73',
    });

    await expect(lastRowFirstEmoji).toHaveAttribute('aria-colindex', '1');
    await expect(lastRowFirstEmoji).toHaveAttribute('aria-selected', 'true');
    await expect(lastRowFirstEmoji.closest('[role="row"]')).toHaveAttribute(
      'aria-rowindex',
      '10',
    );

    const viewport = lastRowFirstEmoji.closest<HTMLElement>(
      '[frimousse-viewport]',
    );

    if (!isDefined(viewport)) {
      throw new Error('Emoji picker viewport is missing');
    }

    await waitFor(() => {
      const emojiBounds = lastRowFirstEmoji.getBoundingClientRect();
      const viewportBounds = viewport.getBoundingClientRect();

      expect(emojiBounds.top).toBeGreaterThanOrEqual(viewportBounds.top);
      expect(emojiBounds.bottom).toBeLessThanOrEqual(viewportBounds.bottom);
      expect(emojiBounds.left).toBeGreaterThanOrEqual(viewportBounds.left);
      expect(emojiBounds.right).toBeLessThanOrEqual(viewportBounds.right);
    });
    await userEvent.keyboard('{Enter}');
    await expect(args.onEmojiSelect).toHaveBeenCalledOnce();
    await expect(args.onEmojiSelect).toHaveBeenCalledWith('🙈');
  },
};
