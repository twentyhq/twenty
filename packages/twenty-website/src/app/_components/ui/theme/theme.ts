import { Background } from '@/app/_components/ui/theme/background';
import { Border } from '@/app/_components/ui/theme/border';
import { Color } from '@/app/_components/ui/theme/colors';
import { Font } from '@/app/_components/ui/theme/font';
import { Icon } from '@/app/_components/ui/theme/icon';
import { Text } from '@/app/_components/ui/theme/text';

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
