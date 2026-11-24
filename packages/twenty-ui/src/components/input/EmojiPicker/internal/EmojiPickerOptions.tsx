import { useMemo, useRef, useState } from 'react';

import { LightIconButton } from '@ui/components/input/LightIconButton/LightIconButton';
import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { useDropdownContext } from '@ui/components/navigation/Dropdown/internal/useDropdownContext';
import { useLoadMoreOnScroll } from '@ui/utilities/scroll/hooks/useLoadMoreOnScroll';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../EmojiPicker.module.scss';
import { type EmojiPickerOptionsProps } from '../types/EmojiPickerOptionsProps';
import { getEmojiPickerSections } from './getEmojiPickerSections';
import { useEmojiPickerContextOrThrow } from './useEmojiPickerContextOrThrow';
import { useEmojiPickerData } from './useEmojiPickerData';

const EMOJI_PICKER_COLUMNS = 8;
const EMOJI_PICKER_PAGE_SIZE = 64;

export const EmojiPickerOptions = ({
  searchLabel,
  searchPlaceholder = searchLabel,
  loadingLabel,
  emptyLabel,
  autoFocus = false,
}: EmojiPickerOptionsProps) => {
  const { emojibaseUrl, locale, onEmojiSelect } =
    useEmojiPickerContextOrThrow();
  const { titleId, triggerId } = useDropdownContext();
  const emojiData = useEmojiPickerData({ emojibaseUrl, locale });
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(EMOJI_PICKER_PAGE_SIZE);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { sections, matchingCount } = useMemo(
    () =>
      isDefined(emojiData)
        ? getEmojiPickerSections({ emojiData, search, visibleCount })
        : { sections: [], matchingCount: 0 },
    [emojiData, search, visibleCount],
  );
  const hasMore = visibleCount < matchingCount;

  useLoadMoreOnScroll({
    sentinelRef,
    scrollContainerRef,
    enabled: hasMore,
    onLoadMore: () =>
      setVisibleCount(
        (previousCount) => previousCount + EMOJI_PICKER_PAGE_SIZE,
      ),
  });

  return (
    <>
      <Dropdown.Search
        aria-label={searchLabel}
        placeholder={searchPlaceholder}
        autoFocus={autoFocus}
        value={search}
        onValueChange={(nextSearch) => {
          setSearch(nextSearch);
          setVisibleCount(EMOJI_PICKER_PAGE_SIZE);
        }}
      />
      <Dropdown.Separator />
      {!isDefined(emojiData) && (
        <Dropdown.Loading>{loadingLabel}</Dropdown.Loading>
      )}
      {isDefined(emojiData) && matchingCount === 0 && (
        <Dropdown.Empty>{emptyLabel}</Dropdown.Empty>
      )}
      {matchingCount > 0 && (
        <Dropdown.SelectionGroup
          aria-labelledby={titleId ?? triggerId}
          value={null}
          onValueChange={(emoji) => {
            if (isDefined(emoji)) {
              onEmojiSelect(emoji);
            }
          }}
        >
          <Dropdown.Section scrollable ref={scrollContainerRef}>
            {sections.map(({ label, emojis }) => (
              <Dropdown.Section
                key={label ?? search}
                label={label}
                columns={EMOJI_PICKER_COLUMNS}
              >
                {emojis.map(({ emoji, label: emojiLabel }) => (
                  <Dropdown.OptionItem
                    key={emoji}
                    aria-label={emojiLabel}
                    title={emojiLabel}
                    value={emoji}
                    indicator="none"
                    nativeButton
                    render={
                      <LightIconButton size="md" aria-label={emojiLabel}>
                        <span className={styles.emoji}>{emoji}</span>
                      </LightIconButton>
                    }
                  />
                ))}
              </Dropdown.Section>
            ))}
            <div ref={sentinelRef}>
              {hasMore && <Dropdown.Loading>{loadingLabel}</Dropdown.Loading>}
            </div>
          </Dropdown.Section>
        </Dropdown.SelectionGroup>
      )}
    </>
  );
};
