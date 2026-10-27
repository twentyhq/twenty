import { styled } from '@linaria/react';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { ExternalLink } from '@/ui';

const Prose = styled.div`
  ${typeRampDeclarations('bodySm')}
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  overflow-wrap: anywhere;

  &[data-tone='ink'] {
    color: ${semanticColor.ink};
  }

  & > * + * {
    margin-top: ${spacing(3)};
  }

  & > * + h3,
  & > * + h4 {
    margin-top: ${spacing(6)};
  }

  & strong,
  & h3,
  & h4 {
    color: ${semanticColor.ink};
    font-weight: ${FONT_WEIGHT.medium};
  }

  & h3 {
    font-size: ${fontSize(4.5)};
  }

  & ul,
  & ol {
    padding-left: ${spacing(5)};
  }

  & li + li {
    margin-top: ${spacing(1)};
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

// Section titles are already rendered as page headings
const COMPONENTS: Components = {
  h1: ({ children }) => <h3>{children}</h3>,
  h2: ({ children }) => <h3>{children}</h3>,
  a: ({ href, children }) =>
    href?.startsWith('http') === true ? (
      <ExternalLink href={href}>{children}</ExternalLink>
    ) : (
      <a href={href}>{children}</a>
    ),
};

type AppReadmeMarkdownProps = {
  markdown: string;
  tone?: 'muted' | 'ink';
};

export function AppReadmeMarkdown({
  markdown,
  tone = 'muted',
}: AppReadmeMarkdownProps) {
  return (
    <Prose data-tone={tone}>
      <Markdown components={COMPONENTS} remarkPlugins={[remarkGfm]}>
        {markdown}
      </Markdown>
    </Prose>
  );
}
