'use client';

import { LinkButton } from '@/design-system/components';
import { ArrowRightUpIcon, SOCIAL_ICONS } from '@/icons';
import type {
  MenuNavItemType,
  MenuScheme,
  MenuSocialLinkType,
} from '@/sections/Menu/types';
import { theme } from '@/theme';
import { Drawer } from '@base-ui/react/drawer';
import { Separator } from '@base-ui/react/separator';
import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { LocalizedLink, useUnlocalizedPathname } from '@/lib/i18n';
import { useLingui } from '@lingui/react';
import React from 'react';

import { DrawerNavGroup } from './DrawerNavGroup';

const StyledDrawerContent = styled.div`
  display: grid;
  grid-template-rows: 1fr auto auto;
  /* Mobile Safari: 100vh equals the large viewport (chrome hidden), which
   * causes the drawer to extend past the visible viewport whenever the URL
   * bar is showing. 100dvh tracks the actually visible viewport. The vh
   * declaration is the fallback for browsers that predate dvh (≈ pre-2022). */
  height: 100vh;
  height: 100dvh;
  left: 0;
  overflow-y: auto;
  padding-bottom: ${theme.spacing(4)};
  padding-left: ${theme.spacing(7)};
  padding-right: ${theme.spacing(7)};
  padding-top: ${theme.spacing(22)};
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: ${theme.zIndex.drawer};

  &[data-scheme='primary'] {
    background: ${theme.colors.primary.background[100]};
  }

  &[data-scheme='secondary'] {
    background: ${theme.colors.secondary.background[100]};
  }
`;

const NavigationContainer = styled.nav`
  align-content: center;
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(8)};
  width: 100%;
`;

const navItemStyles = `
  border-radius: ${theme.radius(2)};
  display: block;
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(8)};
  font-weight: ${theme.font.weight.light};
  letter-spacing: 0;
  line-height: 38px;
  text-decoration: none;
  text-transform: uppercase;
  width: 100%;

  &[data-scheme='primary'] {
    color: ${theme.colors.primary.text[100]};
  }

  &[data-scheme='secondary'] {
    color: ${theme.colors.secondary.text[100]};
  }

  position: relative;

  &[data-active] {
    color: ${theme.colors.highlight[100]};
    &::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 25%;
      width: 50%;
      height: 1px;
      background: ${theme.colors.highlight[100]};
    }
  }

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }
`;

const NavItem = styled(LocalizedLink)`
  ${navItemStyles}
`;

const HorizontalSeparator = styled(Separator)`
  background: repeating-linear-gradient(
    90deg,
    var(--menu-separator-color) 0,
    var(--menu-separator-color) 1px,
    transparent 2px,
    transparent 4px
  );
  border: none;
  height: 1px;
  width: 100%;
`;

const CtaContainer = styled.div`
  margin-bottom: ${theme.spacing(10)};
`;

const SocialContainer = styled.div`
  align-items: center;
  column-gap: ${theme.spacing(6)};
  display: grid;
  grid-auto-flow: column;
  justify-content: center;
  max-width: 100%;
  min-width: 0;
`;

const SocialItem = styled.a`
  align-items: center;
  border-radius: ${theme.radius(1)};
  column-gap: ${theme.spacing(3)};
  display: grid;
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  grid-auto-flow: column;
  line-height: 14px;
  text-decoration: none;
  white-space: nowrap;

  &[data-scheme='primary'] {
    color: ${theme.colors.primary.text[100]};
  }

  &[data-scheme='secondary'] {
    color: ${theme.colors.secondary.text[100]};
  }

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }
`;

const Divider = styled(Separator)`
  height: 10px;
  width: 0px;

  &[data-scheme='primary'] {
    border-left: 1px solid ${theme.colors.primary.border[40]};
  }

  &[data-scheme='secondary'] {
    border-left: 1px solid ${theme.colors.secondary.border[40]};
  }
`;

type MenuDrawerProps = {
  navItems: MenuNavItemType[];
  scheme: MenuScheme;
  socialLinks: MenuSocialLinkType[];
};

export function MenuDrawer({ navItems, scheme, socialLinks }: MenuDrawerProps) {
  const { i18n } = useLingui();
  const pathname = useUnlocalizedPathname();
  const buttonColor = scheme === 'primary' ? 'secondary' : 'primary';

  const iconFillColor =
    scheme === 'primary'
      ? theme.colors.secondary.background[100]
      : theme.colors.primary.background[100];

  const separatorColor =
    scheme === 'primary'
      ? theme.colors.primary.border[60]
      : theme.colors.secondary.border[60];

  const topLevelItems = navItems.filter((item) => item.children || item.href);

  return (
    <Drawer.Portal>
      <Drawer.Popup aria-label="Navigation menu">
        <StyledDrawerContent data-scheme={scheme}>
          <NavigationContainer aria-label="Mobile navigation">
            {topLevelItems.map((item, index) => (
              <React.Fragment key={`${index}-${item.href ?? 'group'}`}>
                {item.children ? (
                  <DrawerNavGroup
                    item={item}
                    pathname={pathname}
                    scheme={scheme}
                  />
                ) : item.href ? (
                  <Drawer.Close
                    nativeButton={false}
                    render={
                      <NavItem
                        data-scheme={scheme}
                        data-active={
                          pathname.startsWith(item.href) || undefined
                        }
                        href={item.href}
                      />
                    }
                  >
                    {i18n._(item.label)}
                  </Drawer.Close>
                ) : null}
                {index < topLevelItems.length - 1 && (
                  <HorizontalSeparator
                    orientation="horizontal"
                    style={
                      {
                        '--menu-separator-color': separatorColor,
                      } as React.CSSProperties
                    }
                  />
                )}
              </React.Fragment>
            ))}
          </NavigationContainer>

          <CtaContainer>
            <LinkButton
              color={buttonColor}
              href="https://app.twenty.com/welcome"
              label={i18n._(msg`Log in`)}
              variant="outlined"
            />
          </CtaContainer>

          <SocialContainer>
            {socialLinks
              .filter((item) => item.showInDrawer)
              .map((item, index) => {
                const IconComponent = SOCIAL_ICONS[item.icon];
                if (!IconComponent) return null;

                return (
                  <React.Fragment key={item.href}>
                    {index > 0 && (
                      <Divider data-scheme={scheme} orientation="vertical" />
                    )}
                    <SocialItem
                      data-scheme={scheme}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.ariaLabel}
                    >
                      <IconComponent
                        size={14}
                        fillColor={iconFillColor}
                        aria-hidden="true"
                      />
                      {item.label ?? null}
                      {item.label && (
                        <ArrowRightUpIcon
                          size={8}
                          strokeColor={theme.colors.highlight[100]}
                          aria-hidden="true"
                        />
                      )}
                    </SocialItem>
                  </React.Fragment>
                );
              })}
          </SocialContainer>
        </StyledDrawerContent>
      </Drawer.Popup>
    </Drawer.Portal>
  );
}
