import { ALL_ICONS } from '@ui/icon/providers/internal/AllIcons';

const DYNAMIC_ICON_NAMES = [
  'IconCopyPlus',
  'IconNumber95Small',
  'IconTimezone',
] as const;

describe('ALL_ICONS', () => {
  it.each(DYNAMIC_ICON_NAMES)(
    'makes %s available to string-based icon resolution',
    (iconName) => {
      expect(ALL_ICONS[iconName]).toBeDefined();
    },
  );
});
