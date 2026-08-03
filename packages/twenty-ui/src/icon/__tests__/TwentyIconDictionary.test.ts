import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { TWENTY_ICON_DICTIONARY } from '@ui/icon/constants/TwentyIconDictionary';
import { generateTwentyIconDictionaryMarkdown } from '@ui/icon/internal/generateTwentyIconDictionaryMarkdown';

describe('TwentyIconDictionary', () => {
  it('has a unique key for every concept', () => {
    const keys = TWENTY_ICON_DICTIONARY.map((entry) => entry.key);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it('references icons exported by twenty-ui/icon', () => {
    const publicIconBarrel = readFileSync(
      resolve(__dirname, '../index.ts'),
      'utf8',
    );

    for (const entry of TWENTY_ICON_DICTIONARY) {
      expect(publicIconBarrel).toMatch(new RegExp(`\\b${entry.iconName}\\b`));
    }
  });

  it('references icons available to string-based icon resolution', () => {
    const dynamicIconCatalog = readFileSync(
      resolve(__dirname, '../providers/internal/AllIcons.ts'),
      'utf8',
    );

    for (const entry of TWENTY_ICON_DICTIONARY) {
      expect(dynamicIconCatalog).toMatch(new RegExp(`\\b${entry.iconName}\\b`));
    }
  });

  it('provides semantic guidance and search keywords for every concept', () => {
    for (const entry of TWENTY_ICON_DICTIONARY) {
      expect(entry.useWhen).not.toHaveLength(0);
      expect(entry.avoidWhen).not.toHaveLength(0);
      expect(entry.keywords.length).toBeGreaterThan(0);
    }
  });

  it('keeps the generated Markdown synchronized with the manifest', () => {
    const markdownPath = resolve(__dirname, '../icon-dictionary.md');

    expect(readFileSync(markdownPath, 'utf8')).toBe(
      generateTwentyIconDictionaryMarkdown(),
    );
  });
});
