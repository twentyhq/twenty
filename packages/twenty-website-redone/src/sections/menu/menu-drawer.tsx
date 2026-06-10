'use client';

import { Drawer } from '@base-ui/react/drawer';
import { IconArrowUpRight } from '@tabler/icons-react';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { Fragment } from 'react';

import { formatCompactCount, type CommunityStats } from '@/platform/community';
import { LocalizedLink } from '@/platform/i18n/localized-link';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  semanticColor,
  spacing,
  Z_INDEX,
} from '@/tokens';
import { Button } from '@/ui';

import { MENU, type MenuNavItem, type MenuSocialLink } from './menu.data';

const DrawerPanel = styled(Drawer.Popup)`
  background-color: ${semanticColor.surface};
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  inset: 0;
  opacity: 1;
  padding: ${spacing(22)} ${spacing(4)} ${spacing(4)};
  position: fixed;
  transition:
    opacity 200ms ease,
    transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
  z-index: ${Z_INDEX.drawer};

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: translateY(-8px);
  }
`;

const DrawerNav = styled.nav`
  display: flex;
  flex-direction: column;
`;

const DrawerNavLink = styled(LocalizedLink)`
  border-bottom: 1px dotted ${semanticColor.lineStrong};
  color: ${semanticColor.ink};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(4)};
  font-weight: ${FONT_WEIGHT.medium};
  padding-block: ${spacing(4)};
  text-decoration: none;
  text-transform: uppercase;

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }
`;

const DrawerFooter = styled.div`
  display: grid;
  gap: ${spacing(10)};
  justify-items: start;
  margin-top: auto;
`;

const SocialRow = styled.div`
  align-items: center;
  column-gap: ${spacing(4)};
  display: flex;
  justify-content: center;
  justify-self: center;
`;

const SocialAnchor = styled.a`
  align-items: center;
  color: ${semanticColor.ink};
  column-gap: ${spacing(2)};
  display: inline-flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  text-decoration: none;
  white-space: nowrap;

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }
`;

const Divider = styled.span`
  background-color: ${semanticColor.lineStrong};
  height: 10px;
  width: 1px;
`;

const Arrow = styled(IconArrowUpRight)`
  color: ${color('blue')};
`;

export type MenuDrawerProps = {
  navItems: readonly MenuNavItem[];
  socialLinks: readonly MenuSocialLink[];
  stats: CommunityStats;
};

export function MenuDrawer({ navItems, socialLinks, stats }: MenuDrawerProps) {
  const { i18n } = useLingui();

  return (
    <Drawer.Portal>
      <DrawerPanel aria-label="Navigation menu">
        <DrawerNav aria-label="Primary">
          {navItems.map((item) => (
            <Drawer.Close
              key={item.href}
              nativeButton={false}
              render={<DrawerNavLink href={item.href} />}
            >
              {i18n._(item.label)}
            </Drawer.Close>
          ))}
        </DrawerNav>
        <DrawerFooter>
          <Button
            href={MENU.appUrl}
            label={i18n._(msg`Log in`)}
            size="small"
            variant="outlined"
          />
          <SocialRow>
            {socialLinks.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <Fragment key={link.href}>
                  {index > 0 && <Divider aria-hidden />}
                  <SocialAnchor
                    aria-label={link.ariaLabel}
                    href={link.href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <IconComponent aria-hidden size={16} stroke={1.6} />
                    {link.statKey
                      ? formatCompactCount(stats[link.statKey])
                      : null}
                    {link.statKey ? (
                      <Arrow aria-hidden size={10} stroke={2} />
                    ) : null}
                  </SocialAnchor>
                </Fragment>
              );
            })}
          </SocialRow>
        </DrawerFooter>
      </DrawerPanel>
    </Drawer.Portal>
  );
}
