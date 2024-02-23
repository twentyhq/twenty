import { Background } from '@/app/ui/theme/background';
import { Border } from '@/app/ui/theme/border';
import { Color } from '@/app/ui/theme/colors';
import { Font } from '@/app/ui/theme/font';
import { Icon } from '@/app/ui/theme/icon';
import { Text } from '@/app/ui/theme/text';

export const Theme = {
  color: Color,
  border: Border,
  background: Background,
  text: Text,
  spacingMultiplicator: 4,
  icon: Icon,
  font: Font,
  spacing: (...args: number[]) =>
    args.map((multiplicator) => `${multiplicator * 4}px`).join(' '),
};
