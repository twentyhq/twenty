import { LinkButton } from '@/design-system/components';
import { PlusIcon, RectangleFillIcon } from '@/icons';
import type { FooterNavGroupType } from '@/sections/Footer/types';
import { theme } from '@/theme';
import { NavigationMenu } from '@base-ui/react/navigation-menu';
import { styled } from '@linaria/react';
import Link from 'next/link';
import React from 'react';

const FooterNav = styled.nav`
  margin-top: ${theme.spacing(10)};
  margin-bottom: ${theme.spacing(10)};

  @media (min-width: ${theme.breakpoints.md}px) {
    display: grid;
    grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
  }
`;

const NavDivider = styled.div`
  align-items: center;
  display: flex;
  gap: ${theme.spacing(1.5)};
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    flex-direction: column;
    height: 100%;
    width: auto;
    margin-left: ${theme.spacing(7)};
    margin-right: ${theme.spacing(7)};
  }
`;

const NavDividerLine = styled.div`
  background-color: #1c1c1c1a;
  flex: 1 1 0%;
  height: 1px;
  min-height: 1px;
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    height: auto;
    min-height: 0;
    min-width: 1px;
    width: 1px;
  }
`;

const NavGroup = styled.section`
  margin-top: ${theme.spacing(4)};
  margin-bottom: ${theme.spacing(4)};

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-top: 0;
    margin-bottom: ${theme.spacing(7)};
  }
`;

const NavGroupTitle = styled.h4`
  font-size: ${theme.font.size(4)};
  font-weight: ${theme.font.weight.medium};
  margin-bottom: ${theme.spacing(2)};
  line-height: 1.35;
`;

const NavMenuList = styled(NavigationMenu.List)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavLinkHoverIcon = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  min-width: 0;
  opacity: 0;
  overflow: hidden;
  transition:
    width 0.3s ease-out,
    opacity 0.3s ease-out;
  width: 0;
`;

const NavLink = styled(NavigationMenu.Link)`
  align-items: center;
  color: ${theme.colors.primary.text[100]};
  display: flex;
  font-size: ${theme.font.size(4)};
  gap: 0;
  text-decoration: none;
  transition: gap 0.3s ease-out;

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    &:hover {
      gap: ${theme.spacing(2)};
    }

    &:hover ${NavLinkHoverIcon} {
      opacity: 1;
      width: 14px;
    }
  }
`;

const Actions = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
  margin-top: ${theme.spacing(8)};

  & > * {
    width: 126px;
  }
`;

type NavProps = {
  groups: FooterNavGroupType[];
};

export function Nav({ groups }: NavProps) {
  return (
    <NavigationMenu.Root render={<FooterNav />}>
      {groups.map((group, index) => (
        <React.Fragment key={group.id}>
          {index > 0 && (
            <NavDivider role="separator">
              <PlusIcon
                size={12}
                strokeColor={theme.colors.highlight[100]}
                aria-hidden
              />
              <NavDividerLine aria-hidden />
              <PlusIcon
                size={12}
                strokeColor={theme.colors.highlight[100]}
                aria-hidden
              />
            </NavDivider>
          )}
          <NavGroup aria-labelledby={group.id}>
            <NavGroupTitle id={group.id}>{group.title}</NavGroupTitle>
            <NavMenuList>
              {group.links.map((link) => (
                <NavigationMenu.Item key={link.href + link.label}>
                  <NavLink
                    render={
                      link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ) : (
                        <Link href={link.href} />
                      )
                    }
                  >
                    <NavLinkHoverIcon aria-hidden>
                      <RectangleFillIcon
                        size={14}
                        fillColor={theme.colors.secondary.background[100]}
                      />
                    </NavLinkHoverIcon>
                    {link.label}
                  </NavLink>
                </NavigationMenu.Item>
              ))}
            </NavMenuList>
            {group.ctas.length > 0 && (
              <Actions>
                {group.ctas.map((cta) => (
                  <LinkButton
                    key={`${cta.label}-${cta.href}`}
                    color={cta.color}
                    href={cta.href}
                    label={cta.label}
                    type={cta.type}
                    variant={cta.variant}
                  />
                ))}
              </Actions>
            )}
          </NavGroup>
        </React.Fragment>
      ))}
    </NavigationMenu.Root>
  );
}
