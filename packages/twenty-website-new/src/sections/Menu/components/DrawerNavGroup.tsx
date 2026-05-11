'use client';

import { INFORMATIVE_ICONS } from '@/icons';
import { LocalizedLink } from '@/lib/i18n';
import type { MenuNavItemType, MenuScheme } from '@/sections/Menu/types';
import { theme } from '@/theme';
import { Drawer } from '@base-ui/react/drawer';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react';
import { useState } from 'react';

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

type DrawerNavGroupProps = {
  item: MenuNavItemType;
  pathname: string;
  scheme: MenuScheme;
};

export function DrawerNavGroup({
  item,
  pathname,
  scheme,
}: DrawerNavGroupProps) {
  const { i18n } = useLingui();
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
        {i18n._(item.label)}
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
                <NavChildLabel>{i18n._(child.label)}</NavChildLabel>
              </Drawer.Close>
            );
          })}
        </NavGroupChildren>
      )}
    </div>
  );
}
