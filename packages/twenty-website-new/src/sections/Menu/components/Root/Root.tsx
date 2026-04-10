'use client';

import { Container, IconButton, LinkButton } from '@/design-system/components';
import { CloseIcon, MenuIcon } from '@/icons';
import type {
  MenuNavItemType,
  MenuScheme,
  MenuSocialLinkType,
} from '@/sections/Menu/types';
import { theme } from '@/theme';
import { Drawer } from '@base-ui/react/drawer';
import { styled } from '@linaria/react';
import { useState, type ReactNode } from 'react';
import { CloseDrawerWhenNavigationExpandsEffect } from '../../effect-components/CloseDrawerWhenNavigationExpandsEffect';
import { MenuDrawer } from '../Drawer/Drawer';

const StyledSection = styled.section`
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.06);
  min-width: 0;
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 200;
`;

const StyledContainer = styled(Container)`
  padding-top: ${theme.spacing(2)};
  padding-bottom: ${theme.spacing(2)};
  position: relative;
  z-index: 100;
`;

const StyledNav = styled.nav`
  align-items: center;
  border-radius: ${theme.radius(2)};
  display: grid;
  grid-auto-flow: column;
  justify-content: space-between;
  min-height: 48px;
  min-width: 0;
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  width: 100%;

  @media (min-width: ${theme.breakpoints.lg}px) {
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
  }
`;

const MobileRightContainer = styled.div`
  align-items: center;
  column-gap: ${theme.spacing(1)};
  display: grid;
  grid-template-columns: auto auto;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: none;
  }
`;

type RootProps = {
  backgroundColor: string;
  children: ReactNode;
  navItems: MenuNavItemType[];
  scheme: MenuScheme;
  socialLinks: MenuSocialLinkType[];
};

export function Root({
  backgroundColor,
  children,
  navItems,
  scheme,
  socialLinks,
}: RootProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const buttonColor: {
    border: string;
    stroke: string;
    linkButton: 'primary' | 'secondary';
  } =
    scheme === 'primary'
      ? {
          border: theme.colors.primary.border[20],
          stroke: theme.colors.primary.text[100],
          linkButton: 'secondary',
        }
      : {
          border: theme.colors.secondary.border[20],
          stroke: theme.colors.secondary.text[100],
          linkButton: 'primary',
        };

  return (
    <Drawer.Root
      open={isDrawerOpen}
      onOpenChange={setIsDrawerOpen}
      swipeDirection="down"
    >
      <CloseDrawerWhenNavigationExpandsEffect
        onClose={() => setIsDrawerOpen(false)}
      />
      <StyledSection style={{ backgroundColor }}>
        <StyledContainer>
          <StyledNav aria-label="Primary navigation" data-scheme={scheme}>
            {children}
            <MobileRightContainer>
              <LinkButton
                color={buttonColor.linkButton}
                href="https://app.twenty.com/welcome"
                label="Get started"
                type="anchor"
                variant="contained"
              />
              <IconButton
                icon={isDrawerOpen ? CloseIcon : MenuIcon}
                ariaLabel={isDrawerOpen ? 'Close menu' : 'Open menu'}
                borderColor={buttonColor.border}
                iconFillColor="none"
                iconSize={14}
                iconStrokeColor={buttonColor.stroke}
                size={40}
                onClick={() => setIsDrawerOpen((prev) => !prev)}
              />
            </MobileRightContainer>
          </StyledNav>
        </StyledContainer>
      </StyledSection>
      <MenuDrawer
        navItems={navItems}
        scheme={scheme}
        socialLinks={socialLinks}
      />
    </Drawer.Root>
  );
}
