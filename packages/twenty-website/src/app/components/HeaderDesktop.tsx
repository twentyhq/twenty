'use client'

import styled from '@emotion/styled'
import { Logo } from './Logo';
import { IBM_Plex_Mono } from 'next/font/google';
import { GithubIcon } from './Icons';

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

    @media(max-width: 809px) {
        display: none;
    }
`;

const LinkList = styled.div`
    display:flex;
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
        background-color: #F1F1F1;
    }
`;

const LogoContainer = styled.div`
display: flex;
align-items: center;
gap: 8px;
width:202px;`;

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
    }`;

const CallToAction = () => {
    return <CallToActionContainer>
        <LinkNextToCTA href="https://github.com/twentyhq/twenty">Sign in</LinkNextToCTA>
        <a href="#">
            <StyledButton>
            Get Started
            </StyledButton>
        </a>
    </CallToActionContainer>;
};


const ExternalArrow = () => {
    return <div style={{width:'14px', height:'14px', fill: 'rgb(179, 179, 179)'}}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" focusable="false" color="rgb(179, 179, 179)"><g color="rgb(179, 179, 179)" ><path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z"></path></g></svg>
    </div>

}

export const HeaderDesktop = () => {

    const isTwentyDev = false;

    return <Nav>
        <LogoContainer>
            <Logo />
            {isTwentyDev && <LogoAddon className={IBMPlexMono.className}>for Developers</LogoAddon>}
        </LogoContainer>
        <LinkList>
            <ListItem href="/pricing">Pricing</ListItem>
            <ListItem href="/story">Story</ListItem>
            <ListItem href="https://docs.twenty.com">Docs <ExternalArrow /></ListItem>
            <ListItem href="https://github.com/twentyhq/twenty"><GithubIcon color='rgb(71,71,71)' /> 5.7k <ExternalArrow /></ListItem>
        </LinkList>
        <CallToAction />
    </Nav>;
};

