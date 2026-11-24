import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { EmojiPickerExample } from './EmojiPickerExample';
import { type EMOJI_PICKER_STORY_DATA } from './emojiPickerStoryData';
import { mockEmojiPickerStoryData } from './mockEmojiPickerStoryData';

const EMOJI_PICKER_SCROLL_STORY_EMOJIBASE_URL = '/emoji-picker-scroll-story';
const EMOJI_PICKER_SCROLL_STORY_EMOJI_COUNT = 80;
const EMOJI_PICKER_SCROLL_STORY_FIRST_EMOJI_CODE_POINT = 0x1f600;
const EMOJI_PICKER_SCROLL_STORY_EMOJIS: typeof EMOJI_PICKER_STORY_DATA.emojis =
  [];

for (const index of new Array<number>(
  EMOJI_PICKER_SCROLL_STORY_EMOJI_COUNT,
).keys()) {
  const codePoint = EMOJI_PICKER_SCROLL_STORY_FIRST_EMOJI_CODE_POINT + index;

  const isPeopleAndBodyCategory =
    index < EMOJI_PICKER_SCROLL_STORY_EMOJI_COUNT / 2;

  EMOJI_PICKER_SCROLL_STORY_EMOJIS.push({
    emoji: String.fromCodePoint(codePoint),
    label: `reaction ${index + 1}`,
    hexcode: codePoint.toString(16).toUpperCase(),
    group: isPeopleAndBodyCategory ? 1 : 6,
    subgroup: isPeopleAndBodyCategory ? 19 : 60,
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
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
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

export const ArrowsCrossSectionsAndScroll: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const search = canvas.getByRole('searchbox', { name: 'Search emojis' });

    await canvas.findByRole('option', { name: 'Reaction 1' });
    await expect(search).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(
      canvas.getByRole('option', { name: 'Reaction 1' }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowDown>5/}');

    const firstEmojiOfSecondSection = canvas.getByRole('option', {
      name: 'Reaction 41',
    });

    await expect(firstEmojiOfSecondSection).toHaveFocus();

    const scrollContainer =
      firstEmojiOfSecondSection.closest<HTMLElement>('[data-scrollable]');

    await expect(scrollContainer).toBeInTheDocument();

    if (!isDefined(scrollContainer)) {
      return;
    }

    await waitFor(() => {
      const emojiBounds = firstEmojiOfSecondSection.getBoundingClientRect();
      const scrollContainerBounds = scrollContainer.getBoundingClientRect();

      expect(scrollContainer.scrollTop).toBeGreaterThan(0);
      expect(emojiBounds.top).toBeGreaterThanOrEqual(scrollContainerBounds.top);
      expect(emojiBounds.bottom).toBeLessThanOrEqual(
        scrollContainerBounds.bottom,
      );
    });

    await userEvent.keyboard('{ArrowUp}');
    await expect(
      canvas.getByRole('option', { name: 'Reaction 40' }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{ArrowRight}{Enter}');
    await expect(args.onEmojiSelect).toHaveBeenCalledOnce();
    await expect(args.onEmojiSelect).toHaveBeenCalledWith(
      String.fromCodePoint(
        EMOJI_PICKER_SCROLL_STORY_FIRST_EMOJI_CODE_POINT + 41,
      ),
    );
  },
};
