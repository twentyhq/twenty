'use client';

import { Drawer } from '@base-ui/react/drawer';
import { IconChevronDown } from '@tabler/icons-react';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { Fragment, useState } from 'react';

import { formatCompactCount, type CommunityStats } from '@/platform/community';
import { useLocale } from '@/platform/i18n';
import { LocalizedLink } from '@/platform/i18n/localized-link';
import {
  buildSchemeDeclarations,
  color,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  type Scheme,
  semanticColor,
  spacing,
  Z_INDEX,
} from '@/tokens';
import { Button, ExternalArrow, ExternalLink, VerticalDivider } from '@/ui';

import { MENU, type MenuNavItem, type MenuSocialLink } from './menu.data';

// Portaled out of the header, the panel re-establishes the menu's scheme
// itself (a portal escapes the [data-scheme] context).
const DrawerPanel = styled(Drawer.Popup)`
  &[data-scheme='light'] {
    ${buildSchemeDeclarations('light')}
  }

  &[data-scheme='muted'] {
    ${buildSchemeDeclarations('muted')}
  }

  &[data-scheme='dark'] {
    ${buildSchemeDeclarations('dark')}
  }

  background-color: ${semanticColor.surface};
  display: grid;
  grid-template-rows: 1fr auto auto;
  height: 100vh;
  height: 100dvh;
  left: 0;
  opacity: 1;
  overflow-y: auto;
  padding: ${spacing(22)} ${spacing(7)} ${spacing(4)};
  position: fixed;
  top: 0;
  transition:
    opacity 200ms ease,
    transform 200ms ${EASING.standard};
  width: 100vw;
  z-index: ${Z_INDEX.drawer};

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: translateY(-8px);
  }
`;

// The nav block centers as a group in the remaining height, with dotted
// hairlines between items only — both ported from the original.
const DrawerNav = styled.nav`
  align-content: center;
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${spacing(8)};
  width: 100%;
`;

const drawerItemStyles = `
  background: none;
  border: none;
  color: ${semanticColor.ink};
  cursor: pointer;
  display: block;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(8)};
  font-weight: ${FONT_WEIGHT.light};
  letter-spacing: 0;
  line-height: 38px;
  padding: 0;
  text-align: start;
  text-decoration: none;
  text-transform: uppercase;
  width: 100%;

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }
`;

const DrawerNavLink = styled(LocalizedLink)`
  ${drawerItemStyles}
`;

const DrawerGroupToggle = styled.button`
  ${drawerItemStyles}
  align-items: center;
  display: flex;
  gap: ${spacing(2)};
  justify-content: space-between;

  svg {
    transition: transform 0.24s ${EASING.standard};
  }

  &[data-expanded] svg {
    transform: rotate(180deg);
  }
`;

const DrawerGroupChildren = styled.div`
  display: grid;
  row-gap: ${spacing(5)};
  padding-top: ${spacing(5)};
`;

const drawerChildStyles = `
  align-items: center;
  color: ${semanticColor.inkMuted};
  display: flex;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(4)};
  font-weight: ${FONT_WEIGHT.medium};
  gap: ${spacing(2)};
  text-decoration: none;
  text-transform: uppercase;

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }
`;

const DrawerChildLink = styled(LocalizedLink)`
  ${drawerChildStyles}
`;

const DrawerChildAnchor = styled(ExternalLink)`
  ${drawerChildStyles}
`;

const DottedSeparator = styled.span`
  background: repeating-linear-gradient(
    90deg,
    ${semanticColor.inkMuted} 0,
    ${semanticColor.inkMuted} 1px,
    transparent 2px,
    transparent 4px
  );
  height: 1px;
  width: 100%;
`;

const CtaRow = styled.div`
  margin-bottom: ${spacing(10)};
`;

const SocialRow = styled.div`
  align-items: center;
  column-gap: ${spacing(6)};
  display: grid;
  grid-auto-flow: column;
  justify-content: center;
`;

const SocialAnchor = styled(ExternalLink)`
  align-items: center;
  color: ${semanticColor.ink};
  column-gap: ${spacing(3)};
  display: grid;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  grid-auto-flow: column;
  line-height: 14px;
  text-decoration: none;
  white-space: nowrap;

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }
`;

export type MenuDrawerProps = {
  navItems: readonly MenuNavItem[];
  scheme: Scheme;
  socialLinks: readonly MenuSocialLink[];
  stats: CommunityStats;
};

export function MenuDrawer({
  navItems,
  scheme,
  socialLinks,
  stats,
}: MenuDrawerProps) {
  const { i18n } = useLingui();
  const locale = useLocale();
  const [isGroupExpanded, setIsGroupExpanded] = useState(false);

  return (
    <Drawer.Portal>
      <DrawerPanel
        aria-label={i18n._(msg`Navigation menu`)}
        data-scheme={scheme}
      >
        <DrawerNav aria-label={i18n._(msg`Primary`)}>
          {navItems.map((item, index) => (
            <Fragment key={i18n._(item.label)}>
              {index > 0 && <DottedSeparator aria-hidden />}
              {item.children === undefined ? (
                <Drawer.Close
                  nativeButton={false}
                  render={<DrawerNavLink href={item.href ?? '/'} />}
                >
                  {i18n._(item.label)}
                </Drawer.Close>
              ) : (
                <div>
                  <DrawerGroupToggle
                    data-expanded={isGroupExpanded ? '' : undefined}
                    onClick={() => setIsGroupExpanded((previous) => !previous)}
                    type="button"
                  >
                    {i18n._(item.label)}
                    <IconChevronDown size={20} stroke={1.6} />
                  </DrawerGroupToggle>
                  {isGroupExpanded && (
                    <DrawerGroupChildren>
                      {item.children.map((child) =>
                        child.external === true ? (
                          <DrawerChildAnchor href={child.href} key={child.href}>
                            {i18n._(child.label)}
                            <ExternalArrow />
                          </DrawerChildAnchor>
                        ) : (
                          <Drawer.Close
                            key={child.href}
                            nativeButton={false}
                            render={<DrawerChildLink href={child.href} />}
                          >
                            {i18n._(child.label)}
                          </Drawer.Close>
                        ),
                      )}
                    </DrawerGroupChildren>
                  )}
                </div>
              )}
            </Fragment>
          ))}
        </DrawerNav>
        <CtaRow>
          <Button
            href={MENU.appUrl}
            label={i18n._(msg`Log in`)}
            size="small"
            variant="outlined"
          />
        </CtaRow>
        <SocialRow>
          {socialLinks.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <Fragment key={link.href}>
                {index > 0 && <VerticalDivider aria-hidden />}
                <SocialAnchor
                  aria-label={i18n._(link.ariaLabel)}
                  href={link.href}
                >
                  <IconComponent aria-hidden size={16} />
                  {link.statKey
                    ? formatCompactCount(stats[link.statKey], locale)
                    : null}
                  {link.statKey ? <ExternalArrow /> : null}
                </SocialAnchor>
              </Fragment>
            );
          })}
        </SocialRow>
      </DrawerPanel>
    </Drawer.Portal>
  );
}
