import { Logo as LogoIcon } from '@/icons';
import { theme } from '@/theme';

export function Logo() {
  return (
    <LogoIcon
      size={40}
      fillColor={theme.colors.primary.background[100]}
      backgroundColor={theme.colors.secondary.background[100]}
    />
  );
}
