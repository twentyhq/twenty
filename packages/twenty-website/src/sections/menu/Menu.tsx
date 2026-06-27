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
import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { MENU_STYLE_BACKGROUND_VAR, useMenuStyle } from '@/platform/menu-style';
import {
  SHADOW,
  DURATION,
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

import { CloseDrawerOnDesktopEffect } from './CloseDrawerOnDesktopEffect';
import { MENU } from './menu.data';
import { MenuDrawer } from './MenuDrawer';
import { MenuNav } from './MenuNav';
import { MenuSocial } from './MenuSocial';
import { ScrollStateEffect } from './ScrollStateEffect';

const headerClassName = css`
  background-color: var(${MENU_STYLE_BACKGROUND_VAR}, ${semanticColor.surface});
  color: ${semanticColor.ink};
  position: sticky;
  top: 0;
  transition:
    background-color ${DURATION.md} ${EASING.gentle},
    box-shadow 0.2s ${EASING.gentle},
    color ${DURATION.md} ${EASING.gentle};
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
    box-shadow: ${SHADOW.header};
  }

  &[data-pinned] {
    transition: box-shadow 0.2s ${EASING.gentle};
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
  const { activeScheme, override } = useMenuStyle();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isElevated, setIsElevated] = useState(false);
  const resolvedScheme = override.scheme ?? activeScheme ?? scheme;

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
        data-elevated={
          isElevated && !override.suppressElevation ? '' : undefined
        }
        data-pinned={override.scheme !== undefined ? '' : undefined}
        data-scheme={resolvedScheme}
      >
        <Container>
          <MenuRow>
            <Drawer.Close
              nativeButton={false}
              render={<LogoLink aria-label={i18n._(msg`Home`)} href="/" />}
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
                ariaLabel={
                  isDrawerOpen
                    ? i18n._(msg`Close menu`)
                    : i18n._(msg`Open menu`)
                }
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
        scheme={resolvedScheme}
        navItems={MENU.navItems}
        socialLinks={MENU.socialLinks}
        stats={communityStats}
      />
    </Drawer.Root>
  );
}
