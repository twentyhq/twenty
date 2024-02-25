'use client';

import styled from '@emotion/styled';
import { Gabarito } from 'next/font/google';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkBehead from 'remark-behead';
import gfm from 'remark-gfm';

import { ReleaseNote } from '@/app/get-releases';

const StyledContainer = styled.div`
  width: 810px;
  margin: 0 auto;
  display: flex;
  font-weight: 400;

  @media (max-width: 810px) {
    width: auto;
    margin: 24px 0;
    display: block;
  }
`;

const StyledVersion = styled.div`
  text-align: center;
  width: 148px;
  font-size: 24px;
  display: flex;
  flex-flow: column;
  align-items: start;
  font-weight: 500;

  @media (max-width: 810px) {
    width: 100%;
    font-size: 20px;
    flex-flow: row;
    justify-content: space-between;
  }
`;

const StyledRelease = styled.span`
  color: #b3b3b3;
`;

const StyledDate = styled.span`
  color: #474747;
  font-size: 16px;
`;

const StlyedContent = styled.div`
  flex: 1;

  h3 {
    color: #141414;
    font-size: 40px;
    margin: 0;
  }

  p {
    color: #474747;
    font-size: 16px;
    line-height: 28.8px;
    color: #818181;
    font-weight: 400;
  }

  img {
    max-width: 100%;
  }
`;

const gabarito = Gabarito({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
});

export const Release = async ({ release }: { release: ReleaseNote }) => {
  let mdxSource;
  try {
    mdxSource = await compileMDX({
      source: release.content,
      options: {
        mdxOptions: {
          remarkPlugins: [gfm, [remarkBehead, { depth: 2 }]],
        },
      },
    });
    mdxSource = mdxSource.content;
  } catch (error) {
    console.error('An error occurred during MDX rendering:', error);
    mdxSource = `<p>Oops! Something went wrong.</p> ${error}`;
  }

  return (
    <StyledContainer className={gabarito.className}>
      <StyledVersion>
        <StyledRelease>{release.release}</StyledRelease>
        <StyledDate>
          {release.date.endsWith(new Date().getFullYear().toString())
            ? release.date.slice(0, -5)
            : release.date}
        </StyledDate>
      </StyledVersion>

      <StlyedContent>{mdxSource}</StlyedContent>
    </StyledContainer>
  );
};
