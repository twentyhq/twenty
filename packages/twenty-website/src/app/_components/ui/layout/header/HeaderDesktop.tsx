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

type Props = {
  numberOfStars: number;
};

export const HeaderDesktop = ({ numberOfStars }: Props) => {
  const formatNumberOfStars = (numberOfStars: number) => {
    if (numberOfStars < 1000) {
      return numberOfStars.toString();
    } else {
      return Math.floor(numberOfStars / 100) / 10 + 'k';
    }
  };

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
          <GithubIcon color="rgb(71,71,71)" />{' '}
          {formatNumberOfStars(numberOfStars)}
          <ExternalArrow />
        </ListItem>
      </LinkList>
      <CallToAction />
    </DesktopNav>
  );
};
