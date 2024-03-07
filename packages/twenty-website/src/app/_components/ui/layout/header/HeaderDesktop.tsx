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

export const HeaderDesktop = () => {
  return (
    <DesktopNav>
      <LogoContainer>
        <Logo />
      </LogoContainer>
      <LinkList>
        <ListItem href="/story">Story</ListItem>
        <ListItem href="/pricing">Pricing</ListItem>
        <ListItem href="https://docs.twenty.com">
          Docs <ExternalArrow />
        </ListItem>
        <ListItem href="https://github.com/twentyhq/twenty">
          <GithubIcon color="rgb(71,71,71)" /> 8.3k <ExternalArrow />
        </ListItem>
      </LinkList>
      <CallToAction />
    </DesktopNav>
  );
};
