'use client';

import { useState } from 'react';
import { IBM_Plex_Mono } from 'next/font/google';

import { ExternalArrow, GithubIcon } from '@/app/_components/ui/icons/SvgIcons';
import { CallToAction } from '@/app/_components/ui/layout/header/callToAction';
import {
  HamburgerContainer,
  HamburgerLine1,
  HamburgerLine2,
  ListItem,
  LogoAddon,
  LogoContainer,
  MobileLinkList,
  MobileMenu,
  MobileNav,
  NavOpen,
} from '@/app/_components/ui/layout/header/styled';
import { Logo } from '@/app/_components/ui/layout/Logo';
import { formatNumberOfStars } from '@/shared-utils/formatNumberOfStars';

const IBMPlexMono = IBM_Plex_Mono({
  weight: '500',
  subsets: ['latin'],
  display: 'swap',
});

type Props = {
  numberOfStars: number;
};

export const HeaderMobile = ({ numberOfStars }: Props) => {
  const isTwentyDev = false;

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <MobileMenu>
      <MobileNav>
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
      </MobileNav>
      <NavOpen
        style={{
          transform: `scaleY(${menuOpen ? '1' : '0'})`,
        }}
      >
        <MobileLinkList>
          <ListItem href="/story">Story</ListItem>
          <ListItem href="/pricing">Pricing</ListItem>
          <ListItem href="/releases">Releases</ListItem>
          <ListItem href="/user-guide">User Guide</ListItem>
          <ListItem href="/developers">Developers</ListItem>
          <ListItem href="https://github.com/twentyhq/twenty">
            <GithubIcon color="rgb(71,71,71)" />{' '}
            {formatNumberOfStars(numberOfStars)} <ExternalArrow />
          </ListItem>
        </MobileLinkList>
        <CallToAction />
      </NavOpen>
    </MobileMenu>
  );
};
