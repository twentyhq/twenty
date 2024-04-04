'use client';

import styled from '@emotion/styled';
import { Gabarito } from 'next/font/google';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkBehead from 'remark-behead';
import gfm from 'remark-gfm';

import { Theme } from '@/app/_components/ui/theme/theme';
import { ReleaseNote } from '@/app/releases/api/route';

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
    margin-bottom: 24px;
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
`;

const StlyedContent = styled.div`
  flex: 1;

  gap: 64px;

  h3 {
    color: ${Theme.text.color.primary};
    font-weight: 700;
    font-size: 40px;
    margin: 0;
  }

  p {
    color: ${Theme.text.color.secondary};
    font-family: ${Theme.font.family};
    font-size: 16px;
    line-height: 28.8px;
    font-weight: 400;
    margin: 40px 0px;
    text-align: justify;
  }

  img {
    max-width: 100%;
  }

  @media (max-width: 810px) {
    h3 {
      font-size: 24px;
    }
  }
`;

const gabarito = Gabarito({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
  variable: '--font-gabarito',
});

export const Release = async ({ release }: { release: ReleaseNote }) => {
  let mdxSource;
  try {
    mdxSource = await compileMDX({
      source: release.content,
      options: {
        mdxOptions: {
          development: process.env.NODE_ENV === 'development',
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
