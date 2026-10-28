import { styled } from '@linaria/react';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  radius,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { ExternalLink } from '@/ui';

const LEADING_TITLE_PATTERN = /^\s*#\s[^\n]*\n+/;

const Prose = styled.div`
  ${typeRampDeclarations('bodyMd')}
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  overflow-wrap: anywhere;

  & > * + * {
    margin-top: ${spacing(4)};
  }

  & > * + h2 {
    margin-top: ${spacing(10)};
  }

  & > * + h3 {
    margin-top: ${spacing(6)};
  }

  & h2 {
    ${typeRampDeclarations('headingXs')}
    color: ${semanticColor.ink};
    font-family: ${fontFamily('serif')};
    font-weight: ${FONT_WEIGHT.light};
  }

  & h3 {
    color: ${semanticColor.ink};
    font-weight: ${FONT_WEIGHT.medium};
  }

  & strong {
    color: ${semanticColor.ink};
    font-weight: ${FONT_WEIGHT.medium};
  }

  & ul,
  & ol {
    padding-left: ${spacing(6)};
  }

  & li + li {
    margin-top: ${spacing(2)};
  }

  & blockquote {
    ${typeRampDeclarations('bodySm')}
  }

  & code {
    color: ${semanticColor.ink};
    font-family: ${fontFamily('mono')};
    font-size: 0.9em;
  }

  & pre,
  & table {
    border: 1px solid ${semanticColor.line};
    border-radius: ${radius(2)};
    display: block;
    max-width: 100%;
    overflow-x: auto;
  }

  & pre {
    padding: ${spacing(3)} ${spacing(4)};
  }

  & table {
    border-collapse: collapse;
  }

  & th,
  & td {
    border-bottom: 1px solid ${semanticColor.line};
    padding: ${spacing(2)} ${spacing(3)};
    text-align: left;
    vertical-align: top;
  }

  & th {
    color: ${semanticColor.ink};
    font-weight: ${FONT_WEIGHT.medium};
  }

  & a {
    color: ${color('blue')};
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`;

const COMPONENTS: Components = {
  a: ({ href, children }) =>
    href?.startsWith('http') === true ? (
      <ExternalLink href={href}>{children}</ExternalLink>
    ) : (
      <a href={href}>{children}</a>
    ),
};

type AppReadmeProps = {
  markdown: string;
};

export function AppReadme({ markdown }: AppReadmeProps) {
  return (
    <Prose>
      <Markdown components={COMPONENTS} remarkPlugins={[remarkGfm]}>
        {markdown.replace(LEADING_TITLE_PATTERN, '')}
      </Markdown>
    </Prose>
  );
}
