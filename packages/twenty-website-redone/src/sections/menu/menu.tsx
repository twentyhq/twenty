'use client';

import { Drawer } from '@base-ui/react/drawer';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { IconMenu2, IconX } from '@tabler/icons-react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useCallback, useState } from 'react';

import { TwentyLogo } from '@/icons';
import { type CommunityStats } from '@/platform/community';
import { LocalizedLink } from '@/platform/i18n/localized-link';
import {
  EASING,
  buildSchemeDeclarations,
  color,
  mediaUp,
  type Scheme,
  semanticColor,
  spacing,
  Z_INDEX,
} from '@/tokens';
import { Button, Container, IconButton } from '@/ui';

import { CloseDrawerOnDesktopEffect } from './close-drawer-on-desktop-effect';
import { MENU } from './menu.data';
import { MenuDrawer } from './menu-drawer';
import { MenuNav } from './menu-nav';
import { MenuSocial } from './menu-social';
import { ScrollStateEffect } from './scroll-state-effect';

// Safari < 18 still needs the -webkit- prefix for backdrop-filter.
const headerClassName = css`
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  background-color: ${semanticColor.surface};
  color: ${semanticColor.ink};
  position: sticky;
  top: 0;
  transition: box-shadow 0.2s ${EASING.gentle};
  width: 100%;
  z-index: ${Z_INDEX.stickyHeader};

  &[data-scheme='light'] {
    ${buildSchemeDeclarations('light')}
  }

  &[data-scheme='muted'] {
    ${buildSchemeDeclarations('muted')}
  }

  &[data-scheme='dark'] {
    ${buildSchemeDeclarations('dark')}
  }

  &[data-elevated] {
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.06);
  }
`;

const MenuRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(5)};
  justify-content: space-between;
  min-height: 64px;
`;

const LogoLink = styled(LocalizedLink)`
  display: grid;
  text-decoration: none;

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }
`;

const DesktopActions = styled.div`
  display: none;

  ${mediaUp('md')} {
    align-items: center;
    display: flex;
    gap: ${spacing(2)};
  }
`;

const MobileActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(2)};

  ${mediaUp('md')} {
    display: none;
  }
`;

export type MenuProps = {
  communityStats: CommunityStats;
  scheme?: Scheme;
};

export function Menu({ communityStats, scheme = 'light' }: MenuProps) {
  const { i18n } = useLingui();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isElevated, setIsElevated] = useState(false);

  const handleScrollStateChange = useCallback(
    (hasScrolled: boolean, isScrolling: boolean) => {
      setIsElevated(hasScrolled || isScrolling);
    },
    [],
  );

  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  return (
    <Drawer.Root open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <CloseDrawerOnDesktopEffect onClose={closeDrawer} />
      <ScrollStateEffect onScrollStateChange={handleScrollStateChange} />
      <header
        className={headerClassName}
        data-elevated={isElevated ? '' : undefined}
        data-scheme={scheme}
      >
        <Container>
          <MenuRow>
            <Drawer.Close
              nativeButton={false}
              render={<LogoLink aria-label="Home" href="/" />}
            >
              <TwentyLogo sizePx={40} />
            </Drawer.Close>
            <MenuNav items={MENU.navItems} />
            <MenuSocial links={MENU.socialLinks} stats={communityStats} />
            <DesktopActions>
              <Button
                href={MENU.appUrl}
                label={i18n._(msg`Log in`)}
                size="small"
                variant="outlined"
              />
              <Button
                href={MENU.appUrl}
                label={i18n._(msg`Get started`)}
                size="small"
              />
            </DesktopActions>
            <MobileActions>
              <Button href={MENU.appUrl} label={i18n._(msg`Get started`)} />
              <IconButton
                ariaLabel={isDrawerOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setIsDrawerOpen((previous) => !previous)}
              >
                {isDrawerOpen ? (
                  <IconX size={16} stroke={1.6} />
                ) : (
                  <IconMenu2 size={16} stroke={1.6} />
                )}
              </IconButton>
            </MobileActions>
          </MenuRow>
        </Container>
      </header>
      <MenuDrawer
        navItems={MENU.navItems}
        socialLinks={MENU.socialLinks}
        stats={communityStats}
      />
    </Drawer.Root>
  );
}
