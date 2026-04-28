import { Logo as LogoIcon } from '@/icons';
import { LocalizedLink } from '@/lib/i18n';
import type { MenuScheme } from '@/sections/Menu/types';
import { theme } from '@/theme';
import { Drawer } from '@base-ui/react/drawer';
import { styled } from '@linaria/react';

const LogoContainer = styled.div`
  align-items: center;
  display: grid;
`;

const LogoLink = styled(LocalizedLink)`
  display: grid;
  text-decoration: none;

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }
`;

type LogoProps = {
  scheme: MenuScheme;
};

export function Logo({ scheme }: LogoProps) {
  const fillColor =
    scheme === 'primary'
      ? theme.colors.primary.background[100]
      : theme.colors.secondary.background[100];

  const backgroundColor =
    scheme === 'primary'
      ? theme.colors.secondary.background[100]
      : theme.colors.primary.background[100];

  return (
    <LogoContainer>
      <Drawer.Close
        nativeButton={false}
        render={<LogoLink href="/" aria-label="Home" />}
      >
        <LogoIcon
          size={40}
          fillColor={fillColor}
          backgroundColor={backgroundColor}
        />
      </Drawer.Close>
    </LogoContainer>
  );
}
