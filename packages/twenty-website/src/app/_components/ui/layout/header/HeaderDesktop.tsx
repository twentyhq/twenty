'use client';

import React from 'react';

import { ExternalArrow, GithubIcon } from '@/app/_components/ui/icons/SvgIcons';
import { CallToAction } from '@/app/_components/ui/layout/header/callToAction';
import {
  DesktopNav,
  LinkList,
  ListItem,
  LogoContainer,
} from '@/app/_components/ui/layout/header/styled';
import { Logo } from '@/app/_components/ui/layout/Logo';

export const HeaderDesktop = ({ stars }: { stars: string | null }) => {
  return (
    <DesktopNav>
      <LogoContainer>
        <Logo />
      </LogoContainer>
      <LinkList>
        <ListItem href="/story">Story</ListItem>
        <ListItem href="/pricing">Pricing</ListItem>
        <ListItem href="/releases">Releases</ListItem>
        <ListItem href="https://docs.twenty.com">
          Docs <ExternalArrow />
        </ListItem>
        {stars && (
          <ListItem href="https://github.com/twentyhq/twenty">
            <GithubIcon color="rgb(71,71,71)" /> {stars} <ExternalArrow />
          </ListItem>
        )}
      </LinkList>
      <CallToAction />
    </DesktopNav>
  );
};
