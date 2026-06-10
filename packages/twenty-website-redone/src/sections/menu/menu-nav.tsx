'use client';

import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { Fragment } from 'react';

import { LocalizedLink } from '@/platform/i18n/localized-link';
import { useUnlocalizedPathname } from '@/platform/i18n/use-unlocalized-pathname';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  semanticColor,
  spacing,
} from '@/tokens';

import { type MenuNavItem } from './menu.data';

const NavRow = styled.nav`
  display: none;

  ${mediaUp('md')} {
    align-items: center;
    column-gap: ${spacing(5)};
    display: flex;
  }
`;

const NavLink = styled(LocalizedLink)`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0;
  padding-block: ${spacing(1)};
  text-decoration: none;
  text-transform: uppercase;
  white-space: nowrap;

  &[aria-current='page'] {
    color: ${color('blue')};
    box-shadow: 0 2px 0 0 ${color('blue')};
  }

  &:hover {
    color: ${color('blue')};
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }
`;

const Divider = styled.span`
  background-color: ${semanticColor.line};
  height: 10px;
  width: 1px;
`;

export type MenuNavProps = {
  items: readonly MenuNavItem[];
};

export function MenuNav({ items }: MenuNavProps) {
  const { i18n } = useLingui();
  const pathname = useUnlocalizedPathname();

  return (
    <NavRow aria-label="Primary">
      {items.map((item, index) => (
        <Fragment key={item.href}>
          {index > 0 && <Divider aria-hidden />}
          <NavLink
            aria-current={pathname === item.href ? 'page' : undefined}
            href={item.href}
          >
            {i18n._(item.label)}
          </NavLink>
        </Fragment>
      ))}
    </NavRow>
  );
}
