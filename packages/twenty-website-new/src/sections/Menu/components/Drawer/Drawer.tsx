import { LinkButton } from '@/design-system/components';
import { ArrowRightUpIcon } from '@/icons';
import { NAV_ITEMS } from '@/sections/Menu/constants/nav-items';
import { SOCIAL_LINKS } from '@/sections/Menu/constants/social-links';
import { theme } from '@/theme';
import { Drawer } from '@base-ui/react/drawer';
import { Separator } from '@base-ui/react/separator';
import { styled } from '@linaria/react';
import Link from 'next/link';
import React from 'react';

const DrawerPopup = styled(Drawer.Popup)`
  background: ${theme.colors.primary.background[100]};
  display: flex;
  flex-direction: column;
  height: 100vh;
  left: 0;
  overflow-y: auto;
  padding-bottom: ${theme.spacing(4)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(35)};
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 90;
`;

const NavigationContainer = styled.nav`
  align-items: stretch;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${theme.spacing(8)};
  justify-content: center;
  width: 100%;
`;

const NavItem = styled(Link)`
  border-radius: ${theme.radius(2)};
  color: ${theme.colors.primary.text[100]};
  display: block;
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(8)};
  font-weight: ${theme.font.weight.light};
  letter-spacing: 0;
  line-height: 38px;
  text-decoration: none;
  text-transform: uppercase;
  width: 100%;

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }
`;

const HorizontalSeparator = styled(Separator)`
  background: repeating-linear-gradient(
    90deg,
    ${theme.colors.primary.border[60]} 0,
    ${theme.colors.primary.border[60]} 1px,
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
  display: flex;
  gap: ${theme.spacing(6)};
`;

const SocialItem = styled.a`
  align-items: center;
  border-radius: ${theme.radius(1)};
  color: ${theme.colors.primary.text[100]};
  display: flex;
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  gap: ${theme.spacing(3)};
  line-height: 14px;
  text-decoration: none;

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

export function MenuDrawer() {
  return (
    <Drawer.Portal>
      <DrawerPopup aria-label="Navigation menu">
        <NavigationContainer aria-label="Mobile navigation">
          {NAV_ITEMS.map((item, index) => (
            <React.Fragment key={item.href}>
              <Drawer.Close
                nativeButton={false}
                render={<NavItem href={item.href} />}
              >
                {item.label}
              </Drawer.Close>
              {index < NAV_ITEMS.length - 1 && (
                <HorizontalSeparator orientation="horizontal" />
              )}
            </React.Fragment>
          ))}
        </NavigationContainer>

        <CtaContainer>
          <LinkButton
            color="secondary"
            href="https://app.twenty.com/welcome"
            label="Log in"
            type="anchor"
            variant="outlined"
          />
        </CtaContainer>

        <SocialContainer>
          {SOCIAL_LINKS.filter((item) => item.showInDrawer).map(
            (item, index) => (
              <React.Fragment key={item.href}>
                {index > 0 && <Divider orientation="vertical" />}
                <SocialItem
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.ariaLabel}
                >
                  <item.icon
                    size={14}
                    fillColor={theme.colors.secondary.background[100]}
                    aria-hidden="true"
                  />
                  {item.label}
                  {item.label && (
                    <ArrowRightUpIcon
                      size={8}
                      strokeColor={theme.colors.highlight[100]}
                      aria-hidden="true"
                    />
                  )}
                </SocialItem>
              </React.Fragment>
            ),
          )}
        </SocialContainer>
      </DrawerPopup>
    </Drawer.Portal>
  );
}
