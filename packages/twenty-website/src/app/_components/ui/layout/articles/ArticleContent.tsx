'use client';

import styled from '@emotion/styled';
import { ReactNode } from 'react';

import { Theme } from '@/app/_components/ui/theme/theme';
import { wrapHeadingsWithAnchor } from '@/shared-utils/wrapHeadingsWithAnchor';

const StyledContent = styled.div`
  flex: 1;
  max-width: 950px;

  code {
    overflow: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
    max-width: 100%;
    line-height: 1.8;
    color: black;
    padding: 4px;
    border-radius: 4px;
    background: #1414140a;
  }

  pre {
    background: #1414140a;
    padding: 4px;
    border-radius: 4px;

    code {
      padding: 0;
      border-radius: 0;
      background: none;
    }
  }

  p {
    color: ${Theme.text.color.secondary};
    font-family: ${Theme.font.family};
    font-size: ${Theme.font.size.sm};
    line-height: 28.8px;
    font-weight: ${Theme.font.weight.regular};
    margin: 32px 0px 0px;
    text-align: justify;
    code {
      font-size: 13px;
    }
  }

  h1,
  h2,
  h3,
  h4 {
    margin-bottom: 8px;
    font-family: var(--font-gabarito);
    color: ${Theme.text.color.primary};
    font-weight: 700;
    a {
      text-decoration: none;
      color: ${Theme.text.color.primary};
    }

    code {
      font-size: 24px;
    }
  }

  h1 {
    margin-top: 64px;
    font-size: 40px;
  }

  h2,
  h3,
  h4 {
    margin-top: 40px;
  }

  h2 {
    font-size: 32px;
  }

  h3 {
    font-size: 28px;
  }

  h4 {
    font-size: 24px;
  }

  h5 {
    font-size: 20px;
  }

  @media (max-width: 810px) {
    h1 {
      font-size: 28px;
    }
    h2 {
      font-size: 24px;
    }
    h3 {
      font-size: 20px;
    }
    h4 {
      font-size: 16px;
    }
    h1,
    h2,
    h3,
    h4 {
      code {
        font-size: 16px;
      }
    }
  }

  ol {
    margin: 32px 0px 0px;
  }

  li {
    margin: 16px 0px 0px;
    line-height: 28.8px;
    font-family: ${Theme.font.family};
    color: ${Theme.text.color.secondary};
  }

  img {
    margin: 32px 0px 0px;
    max-width: 100%;
  }
`;

export const ArticleContent = ({ children }: { children: ReactNode }) => {
  return <StyledContent>{wrapHeadingsWithAnchor(children)}</StyledContent>;
};
