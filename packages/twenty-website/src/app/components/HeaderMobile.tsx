'use client';

import { useState } from 'react';
import styled from '@emotion/styled';
import { IBM_Plex_Mono } from 'next/font/google';

import { ExternalArrow } from '@/app/components/ExternalArrow';

import { GithubIcon } from './Icons';
import { Logo } from './Logo';

const IBMPlexMono = IBM_Plex_Mono({
  weight: '500',
  subsets: ['latin'],
  display: 'swap',
});

const Nav = styled.nav`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  overflow: visible;
  padding: 0 12px;
  position: relative;
  transform-origin: 50% 50% 0px;
  border-bottom: 1px solid rgba(20, 20, 20, 0.08);
  height: 64px;
  width: 100%;
  @media (min-width: 810px) {
    display: none;
  }
`;

const LinkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ListItem = styled.a`
  color: rgb(71, 71, 71);
  text-decoration: none;
  display: flex;
  gap: 4px;
  align-items: center;
  border-radius: 8px;
  height: 40px;
  padding-left: 16px;
  padding-right: 16px;
  &:hover {
    background-color: #f1f1f1;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 202px;
`;

const LogoAddon = styled.div`
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 150%;
`;

const StyledButton = styled.div`
  display: flex;
  height: 40px;
  padding-left: 16px;
  padding-right: 16px;
  align-items: center;
  background-color: #000;
  color: #fff;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  outline: inherit;
  cursor: pointer;
`;

const CallToActionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  a {
    text-decoration: none;
  }
`;

const LinkNextToCTA = styled.a`
  display: flex;
  align-items: center;
  color: rgb(71, 71, 71);
  padding: 0px 16px 0px 16px;
  span {
    text-decoration: underline;
  }
`;

const CallToAction = () => {
  return (
    <CallToActionContainer>
      <LinkNextToCTA href="https://github.com/twentyhq/twenty">
        Sign in
      </LinkNextToCTA>
      <a href="#">
        <StyledButton>Get Started</StyledButton>
      </a>
    </CallToActionContainer>
  );
};

const HamburgerContainer = styled.div`
  height: 44px;
  width: 44px;
  cursor: pointer;
  position: relative;
  input {
    height: 44px;
    width: 44px;
    opacity: 0;
  }

  #line1 {
    transition: transform 0.5s;
    transition-timing-function: ease-in-out;
  }

  #line2 {
    transition: transform 0.5s;
    transition-timing-function: ease-in-out;
  }

  #menu-input:checked ~ #line1 {
    transform: rotate(45deg) translate(7px);
  }

  #menu-input:checked ~ #line2 {
    transform: rotate(-45deg) translate(7px);
  }
`;

const HamburgerLine1 = styled.div`
  height: 2px;
  left: calc(50.00000000000002% - 20px / 2);
  position: absolute;
  top: calc(37.50000000000002% - 2px / 2);
  width: 20px;
  border-radius: 10px;
  background-color: rgb(179, 179, 179);
`;

const HamburgerLine2 = styled.div`
  height: 2px;
  left: calc(50.00000000000002% - 20px / 2);
  position: absolute;
  top: calc(62.50000000000002% - 2px / 2);
  width: 20px;
  border-radius: 10px;
  background-color: rgb(179, 179, 179);
`;

const NavOpen = styled.div`
  flex-direction: column;
  align-items: center;
  position: fixed;
  inset: 0px;
  top: 63px;
  background-color: #fff;
  gap: 33px;
  padding-top: 32px;
  z-index: 100;
`;

const MobileMenu = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const HeaderMobile = () => {
  const isTwentyDev = false;

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <MobileMenu>
      <Nav>
        <LogoContainer>
          <Logo />
          {isTwentyDev && (
            <LogoAddon className={IBMPlexMono.className}>
              for Developers
            </LogoAddon>
          )}
        </LogoContainer>
        <HamburgerContainer>
          <input type="checkbox" id="menu-input" onChange={toggleMenu} />
          <HamburgerLine1 id="line1" />
          <HamburgerLine2 id="line2" />
        </HamburgerContainer>
      </Nav>
      <NavOpen style={{ display: menuOpen ? 'flex' : 'none' }}>
        <LinkList>
          <ListItem href="/pricing">Pricing</ListItem>
          <ListItem href="/story">Story</ListItem>
          <ListItem href="https://docs.twenty.com">
            Docs <ExternalArrow />
          </ListItem>
          <ListItem href="https://github.com/twentyhq/twenty">
            <GithubIcon color="rgb(71,71,71)" /> 5.7k <ExternalArrow />
          </ListItem>
        </LinkList>
        <CallToAction />
      </NavOpen>
    </MobileMenu>
  );
};
