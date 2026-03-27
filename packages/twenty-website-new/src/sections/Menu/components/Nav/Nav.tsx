import { NAV_ITEMS } from '@/sections/Menu/constants/nav-items';
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
    display: flex;
    gap: ${theme.spacing(8)};
  }
`;

const NavLink = styled(NavigationMenu.Link)`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0;
  text-decoration: none;
  text-transform: uppercase;

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }
`;

const Divider = styled(Separator)`
  border-left: 1px solid ${theme.colors.primary.border[40]};
  height: 10px;
  width: 0px;
`;

export function Nav() {
  return (
    <NavigationMenu.Root render={<div />}>
      <NavList>
        {NAV_ITEMS.map((item, index) => (
          <React.Fragment key={item.href}>
            <NavigationMenu.Item>
              <NavLink render={<Link href={item.href} />}>
                {item.label}
              </NavLink>
            </NavigationMenu.Item>
            {index < NAV_ITEMS.length - 1 && (
              <Divider orientation="vertical" />
            )}
          </React.Fragment>
        ))}
      </NavList>
    </NavigationMenu.Root>
  );
}
