import { Logo as LogoIcon } from '@/icons';
import { theme } from '@/theme';
import { Drawer } from '@base-ui/react/drawer';
import { styled } from '@linaria/react';
import Link from 'next/link';

const LogoContainer = styled.div`
  align-items: center;
  display: flex;
`;

const LogoLink = styled(Link)`
  display: flex;
  text-decoration: none;

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }
`;

export function Logo() {
  return (
    <LogoContainer>
      <Drawer.Close
        nativeButton={false}
        render={<LogoLink href="/" aria-label="Home" />}
      >
        <LogoIcon
          size={40}
          fillColor={theme.colors.primary.background[100]}
          backgroundColor={theme.colors.secondary.background[100]}
        />
      </Drawer.Close>
    </LogoContainer>
  );
}
