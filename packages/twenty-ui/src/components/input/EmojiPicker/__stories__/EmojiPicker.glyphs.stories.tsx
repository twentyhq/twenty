import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';

import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { EmojiPickerExample } from './EmojiPickerExample';
import { EMOJI_PICKER_STORY_DATA } from './emojiPickerStoryData';
import { mockEmojiPickerStoryData } from './mockEmojiPickerStoryData';

const EMOJI_PICKER_GLYPHS_STORY_EMOJIBASE_URL = '/emoji-picker-glyphs-story';

const EMOJI_PICKER_GLYPHS_STORY_GROUPS: {
  group: number;
  subgroup: number;
  emojis: [string, string][];
}[] = [
  {
    group: 0,
    subgroup: 1,
    emojis: [
      ['😀', 'grinning face'],
      ['🤣', 'rolling on the floor laughing'],
      ['🫠', 'melting face'],
      ['🥰', 'smiling face with hearts'],
      ['🤩', 'star-struck'],
      ['🥹', 'face holding back tears'],
      ['🤑', 'money-mouth face'],
      ['🤗', 'smiling face with open hands'],
      ['🫢', 'face with open eyes and hand over mouth'],
      ['🫣', 'face with peeking eye'],
      ['🤫', 'shushing face'],
      ['🫡', 'saluting face'],
      ['🤐', 'zipper-mouth face'],
      ['🫥', 'dotted line face'],
      ['😶‍🌫️', 'face in clouds'],
      ['😮‍💨', 'face exhaling'],
      ['🥵', 'hot face'],
      ['🤯', 'exploding head'],
      ['❤️‍🔥', 'heart on fire'],
      ['❤️‍🩹', 'mending heart'],
    ],
  },
  {
    group: 1,
    subgroup: 22,
    emojis: [
      ['👀', 'eyes'],
      ['🫶', 'heart hands'],
      ['🤌', 'pinched fingers'],
      ['🙌', 'raising hands'],
      ['👐', 'open hands'],
      ['🤝', 'handshake'],
      ['🧑‍🤝‍🧑', 'people holding hands'],
      ['👨‍👩‍👧‍👦', 'family: man, woman, girl, boy'],
      ['🏃‍♀️‍➡️', 'woman running facing right'],
    ],
  },
  {
    group: 9,
    subgroup: 100,
    emojis: [
      ['🇫🇷', 'flag: France'],
      ['🇺🇸', 'flag: United States'],
      ['🇯🇵', 'flag: Japan'],
      ['🇧🇷', 'flag: Brazil'],
      ['🏳️‍🌈', 'rainbow flag'],
      ['🏳️‍⚧️', 'transgender flag'],
      ['🏴‍☠️', 'pirate flag'],
      ['🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'flag: Scotland'],
      ['🇺🇳', 'flag: United Nations'],
      ['🇪🇺', 'flag: European Union'],
    ],
  },
];

const EMOJI_PICKER_GLYPHS_STORY_EMOJIS: typeof EMOJI_PICKER_STORY_DATA.emojis =
  EMOJI_PICKER_GLYPHS_STORY_GROUPS.flatMap(({ group, subgroup, emojis }) =>
    emojis.map(([emoji, label]) => ({
      emoji,
      label,
      hexcode: [...emoji]
        .map((character) => character.codePointAt(0)?.toString(16))
        .join('-')
        .toUpperCase(),
      group,
      subgroup,
      version: 1,
      type: 1,
      order: 0,
      text: '',
      tags: [label],
    })),
  ).map((emoji, order) => ({ ...emoji, order }));

const EMOJI_PICKER_GLYPHS_STORY_FIRST_SECTION_LABEL = 'Smileys & emotion';
const EMOJI_PICKER_GLYPHS_STORY_SECTION_LABELS = [
  EMOJI_PICKER_GLYPHS_STORY_FIRST_SECTION_LABEL,
  'People & body',
  'Flags',
];

const meta: Meta<typeof EmojiPickerExample> = {
  id: 'ui-input-emojipicker-glyphs',
  title: 'UI/Components/Input/EmojiPicker/Glyphs',
  component: EmojiPickerExample,
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  beforeEach: () =>
    mockEmojiPickerStoryData({
      emojibaseUrl: EMOJI_PICKER_GLYPHS_STORY_EMOJIBASE_URL,
      emojis: EMOJI_PICKER_GLYPHS_STORY_EMOJIS,
      messages: {
        ...EMOJI_PICKER_STORY_DATA.messages,
        groups: [
          { key: 'smileys-emotion', message: 'smileys & emotion', order: 0 },
          { key: 'people-body', message: 'people & body', order: 1 },
          { key: 'flags', message: 'flags', order: 9 },
        ],
      },
    }),
  args: {
    emojibaseUrl: EMOJI_PICKER_GLYPHS_STORY_EMOJIBASE_URL,
    onEmojiSelect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof EmojiPickerExample>;

export const WideGlyphsRenderWhole: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    const saluteEmoji = await canvas.findByRole('gridcell', {
      name: 'Saluting face',
    });

    const viewport = saluteEmoji.closest<HTMLElement>('[frimousse-viewport]');

    await expect(viewport).toBeInTheDocument();

    if (!isDefined(viewport)) {
      return;
    }

    const glyphRange = document.createRange();

    for (const emojiButton of within(viewport).getAllByRole('gridcell')) {
      const cellBounds = emojiButton.getBoundingClientRect();

      glyphRange.selectNodeContents(emojiButton);

      const glyphBounds = glyphRange.getBoundingClientRect();

      await expect(glyphBounds.left).toBeGreaterThanOrEqual(cellBounds.left);
      await expect(glyphBounds.right).toBeLessThanOrEqual(cellBounds.right);
      await expect(glyphBounds.top).toBeGreaterThanOrEqual(cellBounds.top);
      await expect(glyphBounds.bottom).toBeLessThanOrEqual(cellBounds.bottom);
    }

    const firstRow = saluteEmoji.closest<HTMLElement>('[frimousse-row]');

    await expect(firstRow).toBeInTheDocument();

    if (!isDefined(firstRow)) {
      return;
    }

    const firstRowCellsWidth = within(firstRow)
      .getAllByRole('gridcell')
      .reduce((width, cell) => width + cell.getBoundingClientRect().width, 0);

    await expect(firstRowCellsWidth).toBeCloseTo(
      firstRow.getBoundingClientRect().width,
      0,
    );

    viewport.scrollTop = viewport.scrollHeight;

    const lastEmoji = await canvas.findByRole('gridcell', {
      name: 'Flag: European Union',
    });

    await waitFor(() =>
      expect(lastEmoji.getBoundingClientRect().bottom).toBeLessThan(
        viewport.getBoundingClientRect().bottom,
      ),
    );
  },
};

export const SectionLabelsUseDropdownSectionStyle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    for (const label of EMOJI_PICKER_GLYPHS_STORY_SECTION_LABELS) {
      await expect(await canvas.findByText(label)).toBeVisible();
    }

    const sectionLabel = canvas.getByText(
      EMOJI_PICKER_GLYPHS_STORY_FIRST_SECTION_LABEL,
    );
    const root = sectionLabel.closest<HTMLElement>('[frimousse-root]');

    await expect(root).toBeInTheDocument();

    if (!isDefined(root)) {
      return;
    }

    const sectionLabelStyle = getComputedStyle(sectionLabel);
    const rootStyle = getComputedStyle(root);

    await expect(sectionLabelStyle.fontWeight).toBe('600');
    await expect(sectionLabelStyle.backgroundColor).toBe(
      rootStyle.backgroundColor,
    );
  },
};
