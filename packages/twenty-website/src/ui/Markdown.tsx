import { css } from '@linaria/core';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { isDefined } from 'twenty-shared/utils';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  radius,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';

import { ExternalLink } from './ExternalLink';

const proseClassName = css`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  overflow-wrap: anywhere;

  &[data-size='md'] {
    ${typeRampDeclarations('bodyMd')}
  }

  &[data-size='sm'] {
    ${typeRampDeclarations('bodySm')}
  }

  & > * + * {
    margin-top: ${spacing(4)};
  }

  & > * + h2 {
    margin-top: ${spacing(10)};
  }

  & > * + h3,
  & > * + h4 {
    margin-top: ${spacing(6)};
  }

  & h2 {
    ${typeRampDeclarations('headingXs')}
    color: ${semanticColor.ink};
    font-family: ${fontFamily('serif')};
    font-weight: ${FONT_WEIGHT.light};
  }

  & h3,
  & h4 {
    color: ${semanticColor.ink};
    font-weight: ${FONT_WEIGHT.medium};
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 4px;
  }

  &[data-size='md'] h3 {
    ${typeRampDeclarations('headingXs')}
  }

  & strong {
    color: ${semanticColor.ink};
    font-weight: ${FONT_WEIGHT.medium};
  }

  & ol {
    padding-left: ${spacing(6)};
  }

  & ul {
    list-style: none;
  }

  & ul > li {
    padding-left: ${spacing(5)};
    position: relative;
  }

  & ul > li::before {
    background: ${color('blue')};
    border-radius: 50%;
    content: '';
    height: 5px;
    left: 3px;
    position: absolute;
    top: 9px;
    width: 5px;
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

export type MarkdownHeadingFloor = 'h2' | 'h3';
export type MarkdownSize = 'md' | 'sm';

export type MarkdownProps = {
  allowedElements?: readonly string[];
  className?: string;
  headingFloor?: MarkdownHeadingFloor;
  markdown: string;
  size?: MarkdownSize;
};

const HEADING_TAGS = ['h1', 'h2', 'h3'] as const;

const renderLink: Components['a'] = ({ children, href, title }) =>
  isDefined(href) && /^https?:\/\//.test(href) ? (
    <ExternalLink href={href} title={title}>
      {children}
    </ExternalLink>
  ) : (
    <a href={href} title={title}>
      {children}
    </a>
  );

const HEADING_AT_FLOOR: Record<MarkdownHeadingFloor, Components['h1']> = {
  h2: ({ children }) => <h2>{children}</h2>,
  h3: ({ children }) => <h3>{children}</h3>,
};

const buildComponents = (headingFloor: MarkdownHeadingFloor): Components => {
  const demotedTags = HEADING_TAGS.slice(0, HEADING_TAGS.indexOf(headingFloor));

  return {
    ...Object.fromEntries(
      demotedTags.map((tag) => [tag, HEADING_AT_FLOOR[headingFloor]]),
    ),
    a: renderLink,
  };
};

const COMPONENTS_BY_HEADING_FLOOR: Record<MarkdownHeadingFloor, Components> = {
  h2: buildComponents('h2'),
  h3: buildComponents('h3'),
};

const withoutImages = (allowedElements: MarkdownProps['allowedElements']) =>
  isDefined(allowedElements)
    ? {
        allowedElements: allowedElements.filter((element) => element !== 'img'),
      }
    : { disallowedElements: ['img'] };

export function Markdown({
  allowedElements,
  className,
  headingFloor = 'h2',
  markdown,
  size = 'md',
}: MarkdownProps) {
  return (
    <div
      className={[proseClassName, className].filter(Boolean).join(' ')}
      data-size={size}
    >
      <ReactMarkdown
        components={COMPONENTS_BY_HEADING_FLOOR[headingFloor]}
        remarkPlugins={[remarkGfm]}
        unwrapDisallowed
        {...withoutImages(allowedElements)}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
