'use client';

import { Drawer } from '@base-ui/react/drawer';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

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
  border-bottom: 1px solid ${semanticColor.line};
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
  gap: ${spacing(4)};
  margin-top: auto;
`;

const SocialRow = styled.div`
  display: flex;
  gap: ${spacing(5)};
  justify-content: center;
`;

const SocialAnchor = styled.a`
  color: ${semanticColor.ink};

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }
`;

export type MenuDrawerProps = {
  navItems: readonly MenuNavItem[];
  socialLinks: readonly MenuSocialLink[];
};

export function MenuDrawer({ navItems, socialLinks }: MenuDrawerProps) {
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
          <SocialRow>
            {socialLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <SocialAnchor
                  aria-label={link.ariaLabel}
                  href={link.href}
                  key={link.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <IconComponent aria-hidden size={20} stroke={1.6} />
                </SocialAnchor>
              );
            })}
          </SocialRow>
          <Button href={MENU.appUrl} label={i18n._(msg`Get started`)} />
        </DrawerFooter>
      </DrawerPanel>
    </Drawer.Portal>
  );
}
