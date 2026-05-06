'use client';

import { LinkButton } from '@/design-system/components';
import { ArrowRightUpIcon, INFORMATIVE_ICONS, SOCIAL_ICONS } from '@/icons';
import type {
  MenuNavItemType,
  MenuScheme,
  MenuSocialLinkType,
} from '@/sections/Menu/types';
import { theme } from '@/theme';
import { Drawer } from '@base-ui/react/drawer';
import { Separator } from '@base-ui/react/separator';
import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { LocalizedLink, useUnlocalizedPathname } from '@/lib/i18n';
import { useRenderMessage } from '@/lib/i18n/use-render-message';
import React, { useState } from 'react';

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
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(35)};
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

const NavGroupButton = styled.button`
  ${navItemStyles}
  align-items: center;
  background: none;
  border: none;
  column-gap: ${theme.spacing(2)};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  padding: 0;
  text-align: left;
`;

const NavGroupChevron = styled.span`
  align-items: center;
  display: inline-flex;
  flex-shrink: 0;
  transform: rotate(0deg);
  transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);

  ${NavGroupButton}[aria-expanded='true'] & {
    transform: rotate(180deg);
  }

  svg {
    display: block;
  }
`;

const NavGroupChildren = styled.div`
  display: grid;
  margin-top: ${theme.spacing(7)};
  padding-left: ${theme.spacing(4)};
  row-gap: ${theme.spacing(5)};
`;

const NavChildItemStyles = `
  align-items: center;
  column-gap: ${theme.spacing(3)};
  display: grid;
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(6)};
  font-weight: ${theme.font.weight.light};
  grid-template-columns: auto 1fr;
  letter-spacing: 0;
  line-height: 28px;
  text-decoration: none;
  text-transform: uppercase;
  width: 100%;

  &[data-scheme='primary'] {
    color: ${theme.colors.primary.text[100]};
  }

  &[data-scheme='secondary'] {
    color: ${theme.colors.secondary.text[100]};
  }

  &[data-active] {
    color: ${theme.colors.highlight[100]};
  }

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }
`;

const NavChildItem = styled(LocalizedLink)`
  ${NavChildItemStyles}
`;

const ExternalNavChildItem = styled.a`
  ${NavChildItemStyles}
`;

const NavChildIcon = styled.span`
  align-items: center;
  display: inline-flex;
  flex-shrink: 0;
  height: 24px;
  justify-content: center;
  width: 24px;

  &[data-scheme='primary'] {
    color: ${theme.colors.primary.text[60]};
  }

  &[data-scheme='secondary'] {
    color: ${theme.colors.secondary.text[60]};
  }

  ${NavChildItem}[data-active] &,
  ${ExternalNavChildItem}[data-active] & {
    color: ${theme.colors.highlight[100]};
  }
`;

const NavChildLabel = styled.span`
  &::before {
    background: ${theme.colors.highlight[100]};
    content: '';
    display: none;
    height: 2px;
    margin-right: ${theme.spacing(2)};
    vertical-align: middle;
    width: 10px;
  }

  ${NavChildItem}[data-active] &::before,
  ${ExternalNavChildItem}[data-active] &::before {
    display: inline-block;
  }
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

type NavGroupProps = {
  item: MenuNavItemType;
  pathname: string;
  renderText: (descriptor: MessageDescriptor) => string;
  scheme: MenuScheme;
};

function NavGroup({ item, pathname, renderText, scheme }: NavGroupProps) {
  const hasActiveChild =
    item.children?.some(
      (child) => !child.external && pathname.startsWith(child.href),
    ) ?? false;
  const [isOpen, setIsOpen] = useState(hasActiveChild);

  return (
    <div>
      <NavGroupButton
        type="button"
        aria-expanded={isOpen}
        data-scheme={scheme}
        data-active={hasActiveChild || undefined}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {renderText(item.label)}
        <NavGroupChevron aria-hidden>
          <svg
            width="12"
            height="12"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 3.5L5 6.5L8 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </NavGroupChevron>
      </NavGroupButton>
      {isOpen && (
        <NavGroupChildren>
          {item.children?.map((child) => {
            const IconComponent = child.icon
              ? INFORMATIVE_ICONS[child.icon]
              : null;

            return (
              <Drawer.Close
                key={child.href}
                nativeButton={false}
                render={
                  child.external ? (
                    <ExternalNavChildItem
                      data-scheme={scheme}
                      href={child.href}
                      rel="noopener noreferrer"
                      target="_blank"
                    />
                  ) : (
                    <NavChildItem
                      data-scheme={scheme}
                      data-active={pathname.startsWith(child.href) || undefined}
                      href={child.href}
                    />
                  )
                }
              >
                <NavChildIcon data-scheme={scheme} aria-hidden>
                  {IconComponent && (
                    <IconComponent size={20} color="currentColor" />
                  )}
                </NavChildIcon>
                <NavChildLabel>{renderText(child.label)}</NavChildLabel>
              </Drawer.Close>
            );
          })}
        </NavGroupChildren>
      )}
    </div>
  );
}

type MenuDrawerProps = {
  navItems: MenuNavItemType[];
  scheme: MenuScheme;
  socialLinks: MenuSocialLinkType[];
};

export function MenuDrawer({ navItems, scheme, socialLinks }: MenuDrawerProps) {
  const renderText = useRenderMessage();
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
                  <NavGroup
                    item={item}
                    pathname={pathname}
                    renderText={renderText}
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
                    {renderText(item.label)}
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
              label={renderText(msg`Log in`)}
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
