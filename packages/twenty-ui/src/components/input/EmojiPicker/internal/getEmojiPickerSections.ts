import { type EmojiData } from 'frimousse';

import { normalizeSearchText } from '@ui/utilities/utils/normalizeSearchText';
import { getSearchMatchScore } from '@ui/utilities/utils/getSearchMatchScore';

type EmojiPickerEmoji = { emoji: string; label: string };

type EmojiPickerSection = { label?: string; emojis: EmojiPickerEmoji[] };

export const getEmojiPickerSections = ({
  emojiData,
  search,
  visibleCount,
}: {
  emojiData: EmojiData;
  search: string;
  visibleCount: number;
}): { sections: EmojiPickerSection[]; matchingCount: number } => {
  const query = normalizeSearchText(search).trim();

  if (query === '') {
    const orderedEmojis = [...emojiData.categories]
      .sort((first, second) => first.index - second.index)
      .flatMap((category) =>
        emojiData.emojis
          .filter((emoji) => emoji.category === category.index)
          .map(({ emoji, label }) => ({
            emoji,
            label,
            categoryLabel: category.label,
          })),
      );
    const sections: EmojiPickerSection[] = [];

    for (const { emoji, label, categoryLabel } of orderedEmojis.slice(
      0,
      visibleCount,
    )) {
      const lastSection = sections[sections.length - 1];

      if (lastSection?.label === categoryLabel) {
        lastSection.emojis.push({ emoji, label });
      } else {
        sections.push({ label: categoryLabel, emojis: [{ emoji, label }] });
      }
    }

    return { sections, matchingCount: orderedEmojis.length };
  }

  const matchingEmojis = emojiData.emojis
    .map(({ emoji, label, tags }) => ({
      emoji,
      label,
      score: Math.max(
        ...[label, ...tags].map((searchText) =>
          getSearchMatchScore({
            value: normalizeSearchText(searchText),
            query,
          }),
        ),
      ),
    }))
    .filter(({ score }) => score > 0)
    .sort((first, second) => second.score - first.score);

  return {
    sections: [
      {
        emojis: matchingEmojis
          .slice(0, visibleCount)
          .map(({ emoji, label }) => ({ emoji, label })),
      },
    ],
    matchingCount: matchingEmojis.length,
  };
};
