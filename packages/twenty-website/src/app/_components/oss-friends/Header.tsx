'use client';

import styled from '@emotion/styled';

import { Theme } from '@/app/_components/ui/theme/theme';

const Title = styled.h1`
  font-size: 56px;
  font-weight: 700;
  color: #b3b3b3;
  margin-bottom: 24px;
  margin-top: 64px;

  @media (max-width: 1200px) {
    font-size: 32px;
  }
`;

const Description = styled.h2`
  font-size: 20px;
  color: #818181;
  margin-top: 0px;
  margin-bottom: 36px;
  font-weight: 400;
  line-height: ${Theme.text.lineHeight.lg};
  margin: 0 auto;
  max-width: 600px;
  @media (max-width: 810px) {
    font-size: 18px;
  }
`;

export const Header = () => {
  return (
    <div>
      <Title>
        Open-source <br /> <span style={{ color: 'black' }}>friends</span>
      </Title>

      <Description>
        We are proud to collaborate with a diverse group of partners to promote
        open-source software.
      </Description>
    </div>
  );
};
