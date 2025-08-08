'use client';

import styled from '@emotion/styled';
import { Gabarito } from 'next/font/google';
import { type JSXElementConstructor, type ReactElement } from 'react';

import { type ReleaseNote } from '@/app/(public)/releases/api/route';
import { ArticleContent } from '@/app/_components/ui/layout/articles/ArticleContent';
import MotionContainer from '@/app/_components/ui/layout/LoaderAnimation';
import { Theme } from '@/app/_components/ui/theme/theme';
import { formatGithubPublishedAtDisplayDate } from '@/shared-utils/formatDisplayDate';

const StyledContainer = styled.div`
  width: 810px;
  margin: 0 auto;
  display: flex;
  font-weight: 400;

  @media (max-width: 810px) {
    width: auto;
    display: block;
  }
`;

const StyledVersion = styled.div`
  text-align: center;
  width: 148px;
  min-width: 148px;
  font-size: 24px;
  display: flex;
  flex-flow: column;
  align-items: start;
  font-weight: 500;
  margin-top: 64px;

  @media (max-width: 810px) {
    width: 100%;
    min-width: unset;
    font-size: 20px;
    flex-flow: row;
    justify-content: space-between;
    margin-bottom: -48px;
    margin-top: 0px;
  }
`;

const StyledRelease = styled.span`
  color: ${Theme.text.color.quarternary};
  line-height: 140%;
`;

const StyledDate = styled.span`
  color: ${Theme.text.color.secondary};
  font-weight: 400;
  font-size: ${Theme.font.size.sm};
  white-space: nowrap;
  margin-top: 4px;
`;

const gabarito = Gabarito({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
  variable: '--font-gabarito',
});

export const Release = ({
  release,
  mdxReleaseContent,
  githubPublishedAt,
}: {
  release: ReleaseNote;
  githubPublishedAt: string;
  mdxReleaseContent: ReactElement<any, string | JSXElementConstructor<any>>;
}) => {
  return (
    <MotionContainer>
      <StyledContainer className={gabarito.className}>
        <StyledVersion>
          <StyledRelease>{release.release}</StyledRelease>
          <StyledDate>
            {formatGithubPublishedAtDisplayDate(githubPublishedAt)}
          </StyledDate>
        </StyledVersion>
        <ArticleContent>{mdxReleaseContent}</ArticleContent>
      </StyledContainer>
    </MotionContainer>
  );
};
