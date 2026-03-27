'use client';

import { Container, IconButton, LinkButton } from '@/design-system/components';
import { CloseIcon, MenuIcon } from '@/icons';
import { theme } from '@/theme';
import { Drawer } from '@base-ui/react/drawer';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { CloseDrawerWhenNavigationExpandsEffect } from '../../effect-components/CloseDrawerWhenNavigationExpandsEffect';
import { MenuDrawer } from '../Drawer/Drawer';

const StyledMenuContainer = styled(Container)`
  margin-top: ${theme.spacing(4)};
  position: relative;
  z-index: 100;
`;

const StyledNav = styled.nav`
  align-items: center;
  background-color: ${theme.colors.primary.background[100]};
  border-radius: ${theme.radius(2)};
  display: flex;
  height: 48px;
  justify-content: space-between;
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
  display: flex;
  gap: ${theme.spacing(1)};

  @media (min-width: ${theme.breakpoints.md}px) {
    display: none;
  }
`;

type RootProps = { children: ReactNode };

export function Root({ children }: RootProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <Drawer.Root
      open={isDrawerOpen}
      onOpenChange={setIsDrawerOpen}
      swipeDirection="down"
    >
      <CloseDrawerWhenNavigationExpandsEffect
        onClose={() => setIsDrawerOpen(false)}
      />
      <StyledMenuContainer>
        <StyledNav aria-label="Primary navigation">
          {children}
          <MobileRightContainer>
            <LinkButton
              color="secondary"
              href="https://app.twenty.com/welcome"
              label="Get started"
              type="anchor"
              variant="contained"
            />
            <IconButton
              icon={isDrawerOpen ? CloseIcon : MenuIcon}
              ariaLabel={isDrawerOpen ? 'Close menu' : 'Open menu'}
              borderColor={theme.colors.primary.border[20]}
              iconFillColor="none"
              iconSize={14}
              iconStrokeColor={theme.colors.primary.text[100]}
              size={40}
              onClick={() => setIsDrawerOpen((prev) => !prev)}
            />
          </MobileRightContainer>
        </StyledNav>
      </StyledMenuContainer>
      <MenuDrawer />
    </Drawer.Root>
  );
}
