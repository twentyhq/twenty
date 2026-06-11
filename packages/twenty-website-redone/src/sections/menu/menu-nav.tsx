'use client';

import { NavigationMenu } from '@base-ui/react/navigation-menu';
import { IconChevronDown } from '@tabler/icons-react';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { Fragment } from 'react';

import { LocalizedLink } from '@/platform/i18n/localized-link';
import { useUnlocalizedPathname } from '@/platform/i18n/use-unlocalized-pathname';
import { VerticalDivider } from '@/ui';
import {
  SHADOW,
  EASING,
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  semanticColor,
  spacing,
  Z_INDEX,
} from '@/tokens';

import { MenuDropdown } from './menu-dropdown';
import { type MenuNavItem } from './menu.data';

const NavList = styled(NavigationMenu.List)`
  display: none;
  list-style: none;
  margin: 0;
  padding: 0;

  ${mediaUp('md')} {
    align-items: center;
    column-gap: ${spacing(8)};
    display: grid;
    grid-auto-flow: column;
  }
`;

// Ported item treatment: zero box padding with an expanded invisible
// hit-area, hover/active in highlight blue, active = centered short bar.
const navItemStyles = `
  background: none;
  border: none;
  color: ${semanticColor.ink};
  cursor: pointer;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0;
  padding: 0;
  position: relative;
  text-decoration: none;
  text-transform: uppercase;
  transition: color 0.2s ${EASING.gentle};

  &::before {
    bottom: ${spacing(-3)};
    content: '';
    left: ${spacing(-8)};
    position: absolute;
    right: ${spacing(-8)};
    top: ${spacing(-3)};
  }

  &:hover {
    color: ${color('blue')};
  }

  &[data-active] {
    color: ${color('blue')};

    &::after {
      background: ${color('blue')};
      bottom: -6px;
      content: '';
      height: 2px;
      left: 40%;
      position: absolute;
      width: 20%;
    }
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 1px;
  }
`;

const NavLink = styled(NavigationMenu.Link)`
  ${navItemStyles}
`;

const NavTrigger = styled(NavigationMenu.Trigger)`
  ${navItemStyles}
  align-items: center;
  column-gap: ${spacing(1)};
  display: inline-flex;

  &::before {
    bottom: ${spacing(-5)};
  }

  &[data-popup-open] {
    color: ${color('blue')};
  }
`;

const TriggerChevron = styled(NavigationMenu.Icon)`
  display: inline-flex;
  flex-shrink: 0;
  transition: transform 0.24s ${EASING.standard};

  ${NavTrigger}[data-popup-open] & {
    transform: rotate(180deg);
  }

  svg {
    display: block;
  }
`;

const DropdownPositioner = styled(NavigationMenu.Positioner)`
  transform-origin: var(--transform-origin);
  z-index: ${Z_INDEX.modal};
`;

const DropdownPopup = styled(NavigationMenu.Popup)`
  background: ${semanticColor.surface};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(3)};
  box-shadow: ${SHADOW.popup};
  opacity: 1;
  overflow: hidden;
  transition:
    opacity 0.2s ease,
    transform 0.24s ${EASING.standard};

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: translateY(-4px);
  }
`;

export type MenuNavProps = {
  items: readonly MenuNavItem[];
};

export function MenuNav({ items }: MenuNavProps) {
  const { i18n } = useLingui();
  const pathname = useUnlocalizedPathname();

  return (
    <NavigationMenu.Root aria-label={i18n._(msg`Primary`)}>
      <NavList>
        {items.map((item, index) => (
          <Fragment key={i18n._(item.label)}>
            {index > 0 && <VerticalDivider aria-hidden />}
            <NavigationMenu.Item>
              {item.children === undefined ? (
                <NavLink
                  data-active={pathname === item.href ? '' : undefined}
                  render={<LocalizedLink href={item.href ?? '/'} />}
                >
                  {i18n._(item.label)}
                </NavLink>
              ) : (
                <>
                  <NavTrigger>
                    {i18n._(item.label)}
                    <TriggerChevron>
                      <IconChevronDown size={12} stroke={2} />
                    </TriggerChevron>
                  </NavTrigger>
                  <NavigationMenu.Content>
                    <MenuDropdown items={item.children} />
                  </NavigationMenu.Content>
                </>
              )}
            </NavigationMenu.Item>
          </Fragment>
        ))}
      </NavList>
      <NavigationMenu.Portal>
        <DropdownPositioner align="start" sideOffset={16}>
          <DropdownPopup>
            <NavigationMenu.Viewport />
          </DropdownPopup>
        </DropdownPositioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}
