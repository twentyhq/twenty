'use client';

import { ReactNode } from 'react';
import styled from '@emotion/styled';

import { Theme } from '@/app/_components/ui/theme/theme';

const StyledContent = styled.div`
  flex: 1;

  p {
    color: ${Theme.text.color.secondary};
    font-family: ${Theme.font.family};
    font-size: ${Theme.font.size.sm};
    line-height: 28.8px;
    font-weight: ${Theme.font.weight.regular};
    margin: 32px 0px;
    text-align: justify;
  }

  h1 {
    margin-top: 64px;
    font-family: var(--font-gabarito);
    font-size: 40px;
    color: ${Theme.text.color.primary};
    font-weight: 700;
  }

  h2 {
    margin-top: 64px;
    font-family: var(--font-gabarito);
    font-size: 32px;
    color: ${Theme.text.color.primary};
    font-weight: 700;
  }

  @media (max-width: 810px) {
    h1 {
      font-size: 32px;
    }
    h2 {
      font-size: 28px;
    }
  }

  li {
    margin: 32px 0px;
    line-height: 28.8px;
    font-family: ${Theme.font.family};
    color: ${Theme.text.color.secondary};
  }

  img {
    max-width: 100%;
  }
`;

export const ArticleContent = ({ children }: { children: ReactNode }) => {
  return <StyledContent>{children}</StyledContent>;
};
