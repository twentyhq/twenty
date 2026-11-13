import { isDefined } from '@/utils/validation/isDefined';

import {
  type FilterQuoteCharacter,
  getOpenQuoteAfterCharacter,
} from '@/utils/filter/get-open-quote-after-character';

export const splitFilterArrayItems = (arrayContent: string): string[] => {
  const items: string[] = [];
  let currentItem = '';
  let openQuote: FilterQuoteCharacter | null = null;
  let previousCharacter = '[';

  for (const character of arrayContent) {
    openQuote = getOpenQuoteAfterCharacter({
      character,
      previousCharacter,
      openQuote,
    });
    previousCharacter = character;

    if (character === ',' && !isDefined(openQuote)) {
      items.push(currentItem);
      currentItem = '';
      continue;
    }

    currentItem += character;
  }

  items.push(currentItem);

  return items;
};
