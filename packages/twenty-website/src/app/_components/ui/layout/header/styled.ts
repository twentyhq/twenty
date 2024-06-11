'use client';

import styled from '@emotion/styled';
import { Gabarito } from 'next/font/google';

import mq from '@/app/_components/ui/theme/mq';

const gabarito = Gabarito({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
});

export const DesktopNav = styled.nav`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  overflow: visible;
  padding: 12px 16px 12px 16px;
  position: fixed;
  width: 100%;
  background-color: white;
  z-index: 4;
  transform-origin: 50% 50% 0px;
  border-bottom: 1px solid rgba(20, 20, 20, 0.08);
  font-family: ${gabarito.style.fontFamily};

  @media (max-width: 809px) {
    display: none;
  }
`;

export const MobileNav = styled.nav`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  overflow: visible;
  padding: 0 12px;
  position: fixed;
  width: 100%;
  background-color: white;
  z-index: 4;
  transform-origin: 50% 50% 0px;
  border-bottom: 1px solid rgba(20, 20, 20, 0.08);
  height: 64px;
  width: 100%;
`;

export const LinkList = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2px;
  ${mq({
    marginRight: ['auto', 'auto', '0'],
  })}
`;

export const MobileLinkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
`;

export const ListItem = styled.a`
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

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  ${mq({
    width: ['auto', 'auto', '202px'],
  })}
`;

export const LogoAddon = styled.div`
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 150%;
`;

export const StyledButton = styled.div`
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
  max-width: fit-content;
  font-family: var(--font-gabarito);
`;

export const CallToActionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  a {
    text-decoration: none;
  }
`;

export const LinkNextToCTA = styled.a`
  display: flex;
  align-items: center;
  color: rgb(71, 71, 71);
  padding: 0px 16px 0px 16px;
  span {
    text-decoration: underline;
  }
`;

export const HamburgerContainer = styled.div`
  height: 44px;
  width: 44px;
  position: relative;

  input {
    cursor: pointer;
    height: 44px;
    width: 44px;
    opacity: 0;
    z-index: 1;
  }

  #line1 {
    transition: transform 0.5s;
    transition-timing-function: ease-in-out;
    z-index: 0;
  }

  #line2 {
    transition: transform 0.5s;
    transition-timing-function: ease-in-out;
    z-index: 0;
  }

  #menu-input:checked ~ #line1 {
    transform: rotate(45deg) translate(7px);
  }

  #menu-input:checked ~ #line2 {
    transform: rotate(-45deg) translate(7px);
  }
`;

export const HamburgerLine1 = styled.div`
  height: 2px;
  left: calc(50.00000000000002% - 20px / 2);
  position: absolute;
  top: calc(37.50000000000002% - 2px / 2);
  width: 20px;
  border-radius: 10px;
  background-color: rgb(179, 179, 179);
  z-index: 0;
`;

export const HamburgerLine2 = styled.div`
  height: 2px;
  left: calc(50.00000000000002% - 20px / 2);
  position: absolute;
  top: calc(62.50000000000002% - 2px / 2);
  width: 20px;
  border-radius: 10px;
  background-color: rgb(179, 179, 179);
  z-index: 0;
`;

export const NavOpen = styled.div`
  flex-direction: column;
  align-items: center;
  position: fixed;
  inset: 0px;
  top: 63px;
  background-color: #fff;
  gap: 33px;
  padding-top: 32px;
  z-index: 100;
  transition: transform 0.2s ease-in;
  display: flex;
  transform-origin: top;
`;

export const MobileMenu = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  @media (min-width: 810px) {
    display: none;
  }
`;
