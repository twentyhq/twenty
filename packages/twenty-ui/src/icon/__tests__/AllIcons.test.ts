import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('ALL_ICONS', () => {
  const dynamicIconCatalog = readFileSync(
    resolve(__dirname, '../providers/internal/AllIcons.ts'),
    'utf8',
  );

  it.each(['IconCopyPlus', 'IconNumber95Small', 'IconTimezone'])(
    'makes %s available to string-based icon resolution',
    (iconName) => {
      expect(
        dynamicIconCatalog.match(new RegExp(`\\b${iconName}\\b`, 'g')),
      ).toHaveLength(2);
    },
  );
});
