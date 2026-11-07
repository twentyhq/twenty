import { isDefined } from '@ui/utilities/utils/isDefined';

const EMOJI_PICKER_VIEWPORT_SELECTOR = '[frimousse-viewport]';
const EMOJI_PICKER_ACTIVE_EMOJI_SELECTOR = '[frimousse-emoji][data-active]';
const EMOJI_PICKER_CATEGORY_HEADER_HEIGHT_PROPERTY =
  '--frimousse-category-header-height';

export const scrollActiveEmojiIntoView = (rootElement: HTMLElement) => {
  const viewport = rootElement.querySelector<HTMLElement>(
    EMOJI_PICKER_VIEWPORT_SELECTOR,
  );
  const activeEmoji = viewport?.querySelector<HTMLElement>(
    EMOJI_PICKER_ACTIVE_EMOJI_SELECTOR,
  );

  if (!isDefined(viewport) || !isDefined(activeEmoji)) {
    return;
  }

  const viewportBounds = viewport.getBoundingClientRect();
  const emojiBounds = activeEmoji.getBoundingClientRect();
  const categoryHeaderHeight = Number.parseFloat(
    getComputedStyle(viewport).getPropertyValue(
      EMOJI_PICKER_CATEGORY_HEADER_HEIGHT_PROPERTY,
    ),
  );
  const topOverflow =
    emojiBounds.top - viewportBounds.top - categoryHeaderHeight;

  if (topOverflow < 0) {
    viewport.scrollTop += topOverflow;
    return;
  }

  const bottomOverflow = emojiBounds.bottom - viewportBounds.bottom;

  if (bottomOverflow > 0) {
    viewport.scrollTop += bottomOverflow;
  }
};
