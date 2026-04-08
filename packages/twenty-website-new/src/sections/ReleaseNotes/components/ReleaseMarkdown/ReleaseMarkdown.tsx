'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MARKETING_ORIGIN =
  process.env.NEXT_PUBLIC_MARKETING_ASSET_ORIGIN ?? 'https://twenty.com';

function resolveAssetUrl(url: string | undefined): string {
  if (!url) {
    return '';
  }
  if (url.startsWith('/')) {
    return `${MARKETING_ORIGIN}${url}`;
  }
  return url;
}

const Prose = styled.div`
  max-width: 100%;
  min-width: 0;

  h1 {
    color: ${theme.colors.primary.text[100]};
    font-size: ${theme.font.size(8)};
    font-weight: ${theme.font.weight.medium};
    line-height: 1.25;
    margin: 0;
    margin-top: ${theme.spacing(8)};

    &:first-child {
      margin-top: 0;
    }
  }

  h2 {
    color: ${theme.colors.primary.text[100]};
    font-size: ${theme.font.size(6)};
    font-weight: ${theme.font.weight.medium};
    line-height: 1.3;
    margin: 0;
    margin-top: ${theme.spacing(8)};

    &:first-child {
      margin-top: 0;
    }
  }

  h3 {
    color: ${theme.colors.primary.text[100]};
    font-size: ${theme.font.size(5)};
    font-weight: ${theme.font.weight.medium};
    line-height: 1.35;
    margin: 0;
    margin-top: ${theme.spacing(6)};
  }

  p {
    color: ${theme.colors.primary.text[80]};
    font-size: ${theme.font.size(4)};
    line-height: 1.65;
    margin: 0;
    margin-top: ${theme.spacing(4)};
  }

  ul,
  ol {
    color: ${theme.colors.primary.text[80]};
    font-size: ${theme.font.size(4)};
    line-height: 1.65;
    margin: ${theme.spacing(4)} 0 0;
    padding-left: ${theme.spacing(6)};
  }

  li {
    margin-top: ${theme.spacing(2)};
  }

  a {
    color: ${theme.colors.highlight[100]};
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  code {
    background-color: ${theme.colors.primary.border[10]};
    border-radius: ${theme.radius(1)};
    font-family: ${theme.font.family.mono};
    font-size: 0.9em;
    padding: 0.1em 0.35em;
  }

  pre {
    background-color: ${theme.colors.primary.border[10]};
    border-radius: ${theme.radius(2)};
    margin-top: ${theme.spacing(4)};
    overflow: auto;
    padding: ${theme.spacing(4)};
  }

  pre code {
    background: none;
    padding: 0;
  }

  img {
    border-radius: ${theme.radius(2)};
    display: block;
    height: auto;
    margin-top: ${theme.spacing(6)};
    max-width: 100%;
  }

  hr {
    border: none;
    border-top: 1px solid ${theme.colors.primary.border[20]};
    margin: ${theme.spacing(8)} 0 0;
  }

  blockquote {
    border-left: 2px solid ${theme.colors.primary.border[40]};
    color: ${theme.colors.primary.text[60]};
    margin: ${theme.spacing(4)} 0 0;
    padding-left: ${theme.spacing(4)};
  }
`;

type ReleaseMarkdownProps = {
  markdown: string;
};

export function ReleaseMarkdown({ markdown }: ReleaseMarkdownProps) {
  return (
    <Prose>
      <ReactMarkdown
        components={{
          a: ({ children, href, ...props }) => (
            <a href={resolveAssetUrl(href)} rel="noopener noreferrer" {...props}>
              {children}
            </a>
          ),
          img: ({ alt, src, ...props }) => (
            <img alt={alt ?? ''} src={resolveAssetUrl(src)} {...props} />
          ),
        }}
        remarkPlugins={[remarkGfm]}
        urlTransform={(value) => value}
      >
        {markdown}
      </ReactMarkdown>
    </Prose>
  );
}
