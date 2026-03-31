import type { MenuNavItemType, MenuScheme } from '@/sections/Menu/types';
import { theme } from '@/theme';
import { NavigationMenu } from '@base-ui/react/navigation-menu';
import { Separator } from '@base-ui/react/separator';
import { styled } from '@linaria/react';
import Link from 'next/link';
import React from 'react';

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

const NavLink = styled(NavigationMenu.Link)`
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0;
  text-decoration: none;
  text-transform: uppercase;

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

type NavProps = {
  navItems: MenuNavItemType[];
  scheme: MenuScheme;
};

export function Nav({ navItems, scheme }: NavProps) {
  return (
    <NavigationMenu.Root render={<div />}>
      <NavList>
        {navItems.map((item, index) => (
          <React.Fragment key={item.href}>
            <NavigationMenu.Item>
              <NavLink
                data-scheme={scheme}
                render={<Link href={item.href} />}
              >
                {item.label}
              </NavLink>
            </NavigationMenu.Item>
            {index < navItems.length - 1 && (
              <Divider data-scheme={scheme} orientation="vertical" />
            )}
          </React.Fragment>
        ))}
      </NavList>
    </NavigationMenu.Root>
  );
}
