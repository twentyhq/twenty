'use client';

import styled from '@emotion/styled';
import { Gabarito } from 'next/font/google';

import { Theme } from '@/app/_components/ui/theme/theme';

export interface OssData {
  name: string;
  description: string;
  href: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 312px;
  height: 360px;
  background-color: #fafafa;
  border: 2px solid black;
  text-align: left;
  padding: 32px;
  border-radius: 8px;
  cursor: pointer;
  transition: 200ms;
  max-width: 400px;
  &:hover {
    -webkit-box-shadow: -3px 3px 2px 0px rgba(0, 0, 0, 1);
    -moz-box-shadow: -3px 3px 2px 0px rgba(0, 0, 0, 1);
    box-shadow: -3px 3px 2px 0px rgba(0, 0, 0, 1);
  }

  @media (max-width: 1200px) {
    width: 45%;
  }

  @media (max-width: 810px) {
    width: 100%;
  }
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-content: flex-start;
`;

const Title = styled.p`
  font-size: 32px;
  font-weight: 700;
  color: ${Theme.text.color.secondary};
  margin: 16px 0px;
  @media (max-width: 1200px) {
    font-size: 24px;
  }
`;

const Description = styled.p`
  font-size: 16px;
  font-weight: 500;
  color: #b3b3b3;
  line-height: ${Theme.text.lineHeight.lg};
  margin: 0;
`;

const Button = styled.a`
  border: 2px solid black;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 20px;
  font-weight: 500;
  color: black;
  background-color: white;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  position: relative;
  height: 60px;

  @media (max-width: 800px) {
    font-size: 18px;
  }

  &:after {
    content: 'Visit Website';
    border: 2px solid black;
    border-radius: 12px;
    position: absolute;
    display: block;
    left: 8px;
    bottom: 7px;
    height: 60px;
    line-height: 60px;
    width: 100%;
    background-color: white;
    transition: 200ms;
  }

  &:hover:after {
    left: 4px;
    bottom: 3px;
  }
`;

const gabarito = Gabarito({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
});

const Icon = styled.img`
  height: 24px;
  width: 24px;
  border-radius: 4px;
`;

// remove the protocol from the url
const removeProtocol = (url: string) => url.replace(/(^\w+:|^)\/\//, '');

export const Card = ({ data }: { data: OssData }) => {
  return (
    <Container>
      <StyledContent>
        <Icon src={`https://twenty-icons.com/${removeProtocol(data.href)}`} />
        <Title>{data.name}</Title>
        <Description>{data.description}</Description>
      </StyledContent>

      <Button href={data.href} className={gabarito.className}></Button>
    </Container>
  );
};
