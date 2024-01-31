'use client';

import styled from '@emotion/styled';
import { IBM_Plex_Mono } from 'next/font/google';
import { usePathname } from 'next/navigation';

import { ExternalArrow } from '@/app/components/ExternalArrow';

import { DiscordIcon, GithubIcon, GithubIcon2, XIcon } from './Icons';
import { Logo } from './Logo';

const IBMPlexMono = IBM_Plex_Mono({
  weight: '500',
  subsets: ['latin'],
  display: 'swap',
});

const Nav = styled.nav`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  overflow: visible;
  padding: 12px 16px 12px 16px;
  position: relative;
  transform-origin: 50% 50% 0px;
  border-bottom: 1px solid rgba(20, 20, 20, 0.08);

  @media (max-width: 809px) {
    display: none;
  }
`;

const LinkList = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2px;
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
  const path = usePathname();
  const isTwentyDev = path.includes('developers');

  return (
    <CallToActionContainer>
      {isTwentyDev ? (
        <>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <a href="https://x.com/twentycrm" target="_blank" rel="noreferrer">
              <XIcon size="M" />
            </a>
            <a
              href="https://github.com/twentyhq/twenty"
              target="_blank"
              rel="noreferrer"
            >
              <GithubIcon2 size="M" />
            </a>
            <a
              href="https://discord.gg/UfGNZJfAG6"
              target="_blank"
              rel="noreferrer"
            >
              <DiscordIcon size="M" />
            </a>
          </div>
        </>
      ) : (
        <>
          <LinkNextToCTA href="https://github.com/twentyhq/twenty">
            Sign in
          </LinkNextToCTA>
          <a href="https://twenty.com/stripe-redirection">
            <StyledButton>Get Started</StyledButton>
          </a>
        </>
      )}
    </CallToActionContainer>
  );
};

export const HeaderDesktop = () => {
  const path = usePathname();
  const isTwentyDev = path.includes('developers');

  return (
    <Nav>
      <LogoContainer>
        <Logo />
        {isTwentyDev && (
          <LogoAddon className={IBMPlexMono.className}>
            for Developers
          </LogoAddon>
        )}
      </LogoContainer>
      {isTwentyDev ? (
        <LinkList>
          <ListItem href="/developers/docs">Docs</ListItem>
          <ListItem href="/developers/contributors">Contributors</ListItem>
          <ListItem href="/">
            Cloud <ExternalArrow />
          </ListItem>
        </LinkList>
      ) : (
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
      )}
      <CallToAction />
    </Nav>
  );
};
