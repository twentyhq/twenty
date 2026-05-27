'use client';

import type { MenuNavItemType, MenuScheme } from '@/sections/Menu/types';
import { theme } from '@/theme';
import { NavigationMenu } from '@base-ui/react/navigation-menu';
import { Separator } from '@base-ui/react/separator';
import { styled } from '@linaria/react';
import { LocalizedLink, useUnlocalizedPathname } from '@/lib/i18n';
import { useLingui } from '@lingui/react';
import React from 'react';

import { NavDropdownContent } from './NavDropdown';

const NavList = styled(NavigationMenu.List)`
  display: none;
  list-style: none;
  margin: 0;
  padding: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: center;
    column-gap: ${theme.spacing(8)};
    display: grid;
    grid-auto-flow: column;
  }
`;

const navItemStyles = `
  background: none;
  border: none;
  cursor: pointer;
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0;
  padding: 0;
  text-decoration: none;
  text-transform: uppercase;
  transition: color 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &[data-scheme='primary'] {
    color: ${theme.colors.primary.text[100]};
  }

  &[data-scheme='secondary'] {
    color: ${theme.colors.secondary.text[100]};
  }

  &:hover {
    color: ${theme.colors.highlight[100]};
  }

  position: relative;

  &::before {
    bottom: ${theme.spacing(-3)};
    content: '';
    left: ${theme.spacing(-8)};
    position: absolute;
    right: ${theme.spacing(-8)};
    top: ${theme.spacing(-3)};
  }

  &[data-active] {
    color: ${theme.colors.highlight[100]};
    &::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 40%;
      width: 20%;
      height: 2px;
      background: ${theme.colors.highlight[100]};
    }
  }

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }
`;

const NavLink = styled(NavigationMenu.Link)`
  ${navItemStyles}
`;

const NavTrigger = styled(NavigationMenu.Trigger)`
  ${navItemStyles}
  align-items: center;
  column-gap: ${theme.spacing(1)};
  display: inline-flex;

  &::before {
    bottom: ${theme.spacing(-5)};
  }

  &[data-popup-open] {
    color: ${theme.colors.highlight[100]};
  }
`;

const TriggerChevron = styled(NavigationMenu.Icon)`
  display: inline-flex;
  flex-shrink: 0;
  transform: rotate(0deg);
  transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);

  ${NavTrigger}[data-popup-open] & {
    transform: rotate(180deg);
  }

  svg {
    display: block;
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

const DropdownPositioner = styled(NavigationMenu.Positioner)`
  box-sizing: border-box;
  transform-origin: var(--transform-origin);
  z-index: ${theme.zIndex.modal};
`;

const DropdownPopup = styled(NavigationMenu.Popup)`
  background: ${theme.colors.primary.background[100]};
  border: 1px solid ${theme.colors.primary.border[10]};
  border-radius: ${theme.radius(3)};
  box-shadow:
    0 1px 1px rgba(0, 0, 0, 0.02),
    0 8px 24px rgba(0, 0, 0, 0.06),
    0 24px 64px rgba(0, 0, 0, 0.04);
  min-width: 320px;
  max-width: min(720px, calc(100vw - ${theme.spacing(8)}));
  opacity: 1;
  overflow: hidden;
  transform: translateY(0) scale(1);
  transform-origin: var(--transform-origin);
  transition-duration: 220ms;
  transition-property: opacity, transform;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: translateY(-6px) scale(0.98);
  }

  &[data-instant] {
    transition-duration: 0ms;
  }

  &[data-scheme='secondary'] {
    background: ${theme.colors.secondary.background[100]};
    border-color: ${theme.colors.secondary.border[10]};
    box-shadow:
      0 1px 1px rgba(0, 0, 0, 0.4),
      0 8px 24px rgba(0, 0, 0, 0.35),
      0 24px 64px rgba(0, 0, 0, 0.25);
  }
`;

const DropdownViewport = styled(NavigationMenu.Viewport)`
  position: relative;
`;

type NavProps = {
  navItems: MenuNavItemType[];
  scheme: MenuScheme;
};

export function Nav({ navItems, scheme }: NavProps) {
  const { i18n } = useLingui();
  const pathname = useUnlocalizedPathname();

  const hasDropdown = navItems.some((item) => item.children);

  return (
    <NavigationMenu.Root delay={0} render={<div />}>
      <NavList>
        {navItems.map((item, index) => {
          const isLast = index === navItems.length - 1;

          return (
            <React.Fragment key={`${index}-${item.href ?? 'dropdown'}`}>
              <NavigationMenu.Item>
                {item.children ? (
                  <>
                    <NavTrigger
                      data-scheme={scheme}
                      data-active={
                        item.children.some(
                          (child) =>
                            !child.external && pathname.startsWith(child.href),
                        ) || undefined
                      }
                    >
                      {i18n._(item.label)}
                      <TriggerChevron aria-hidden>
                        <svg
                          width="8"
                          height="8"
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
                      </TriggerChevron>
                    </NavTrigger>
                    <NavigationMenu.Content>
                      <NavDropdownContent
                        items={item.children}
                        pathname={pathname}
                        scheme={scheme}
                      />
                    </NavigationMenu.Content>
                  </>
                ) : (
                  item.href && (
                    <NavLink
                      data-scheme={scheme}
                      data-active={pathname.startsWith(item.href) || undefined}
                      render={<LocalizedLink href={item.href} />}
                    >
                      {i18n._(item.label)}
                    </NavLink>
                  )
                )}
              </NavigationMenu.Item>
              {!isLast && (
                <Divider data-scheme={scheme} orientation="vertical" />
              )}
            </React.Fragment>
          );
        })}
      </NavList>
      {hasDropdown && (
        <NavigationMenu.Portal>
          <DropdownPositioner sideOffset={12} align="start">
            <DropdownPopup data-scheme={scheme}>
              <DropdownViewport />
            </DropdownPopup>
          </DropdownPositioner>
        </NavigationMenu.Portal>
      )}
    </NavigationMenu.Root>
  );
}
