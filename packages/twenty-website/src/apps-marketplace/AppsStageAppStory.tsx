import { styled } from '@linaria/react';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { isDefined } from 'twenty-shared/utils';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';
import { ExternalLink } from '@/ui';

import { stripLeadingMarkdownTitle } from './strip-leading-markdown-title';

// PROTOTYPE (?direction=e): an app's README set like Linear's integration
// pages: one calm column, sans headings with generous space above, body at
// 15/24 in a light grey, plain lists. The README is the source; only its
// setting changes.
const Story = styled.div`
  color: ${color('white-80')};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.75)};
  line-height: 24px;
  max-width: 624px;

  & > * + * {
    margin-top: ${spacing(4)};
  }

  & h2,
  & h3 {
    color: ${semanticColor.ink};
    font-family: ${fontFamily('sans')};
    font-weight: ${FONT_WEIGHT.medium};
  }

  & h2 {
    font-size: ${fontSize(6)};
    letter-spacing: -0.012em;
    line-height: 32px;
  }

  & h3 {
    font-size: ${fontSize(5)};
    line-height: 32px;
  }

  & > h2,
  & > h3 {
    margin-top: ${spacing(14)};
  }

  & > :first-child {
    margin-top: 0;
  }

  & > h2 + *,
  & > h3 + * {
    margin-top: ${spacing(3)};
  }

  & strong {
    color: ${semanticColor.ink};
    font-weight: ${FONT_WEIGHT.medium};
  }

  & ul,
  & ol {
    padding-left: ${spacing(5)};
  }

  & ul {
    list-style: disc;
  }

  & ol {
    list-style: decimal;
  }

  & li::marker {
    color: ${semanticColor.inkSubtle};
  }

  & li + li {
    margin-top: ${spacing(2)};
  }

  & li > p + p {
    margin-top: ${spacing(2)};
  }

  & code {
    background-color: ${color('white-5')};
    border: 1px solid ${semanticColor.line};
    border-radius: ${radius(1)};
    color: ${semanticColor.ink};
    font-family: ${fontFamily('mono')};
    font-size: 0.85em;
    padding: 1px ${spacing(1)};
  }

  & a {
    color: ${semanticColor.ink};
    text-decoration: underline;
    text-decoration-color: ${semanticColor.lineStrong};
    text-underline-offset: 3px;
  }

  & a:hover {
    text-decoration-color: ${semanticColor.ink};
  }

  & blockquote {
    border-left: 1px solid ${semanticColor.lineStrong};
    padding-left: ${spacing(4)};
  }

  & blockquote > * + * {
    margin-top: ${spacing(2)};
  }

  & table {
    border-collapse: collapse;
    width: 100%;
  }

  & th,
  & td {
    border-bottom: 1px solid ${semanticColor.line};
    padding: ${spacing(2)} ${spacing(3)} ${spacing(2)} 0;
    text-align: left;
  }

  & th {
    color: ${semanticColor.ink};
    font-weight: ${FONT_WEIGHT.medium};
  }
`;

// The list itself is a row of chips, each with the site's checkmark.
const Chips = styled.ul`
  && {
    display: flex;
    list-style: none;
    padding-left: 0;
    flex-wrap: wrap;
    gap: ${spacing(2)};
    max-width: none;
  }

  && > li {
    margin-top: 0;
    align-items: center;
    border: 1px solid ${semanticColor.line};
    border-radius: ${radius(2)};
    color: ${semanticColor.ink};
    display: inline-flex;
    gap: ${spacing(2)};
    padding: ${spacing(2)} ${spacing(3)};
  }

  && > li::before {
    background-color: var(--apps-stage-pastel, ${color('blue')});
    content: '';
    flex-shrink: 0;
    height: 10px;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='m2.5 6 2.5 2.5 4.5-5' fill='none' stroke='black' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
      center / contain no-repeat;
    width: 10px;
  }
`;

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  children?: HastNode[];
};

const textOf = (node: HastNode): string =>
  node.type === 'text'
    ? (node.value ?? '')
    : (node.children ?? []).map(textOf).join('');

const isNameList = (node: HastNode | undefined): boolean => {
  const items = (node?.children ?? []).filter(
    (child) => child.tagName === 'li',
  );

  return (
    items.length >= 2 &&
    items.every((item) => {
      const text = textOf(item).trim();

      return text.length <= CHIP_ITEM_MAX_LENGTH && !/[.:;]/.test(text);
    })
  );
};

const COMPONENTS: Components = {
  h1: ({ children }) => <h2>{children}</h2>,
  ul: ({ children, node }) =>
    isNameList(node as HastNode | undefined) ? (
      <Chips data-apps-stage-chips="">{children}</Chips>
    ) : (
      <ul>{children}</ul>
    ),
  a: ({ href, children }) =>
    isDefined(href) && href.startsWith('http') ? (
      <ExternalLink href={href}>{children}</ExternalLink>
    ) : (
      <a href={href}>{children}</a>
    ),
};

// Emoji opening a heading or a list item read as decoration here: the
// eyebrow marker and the check chips do that job.
const HEADING_EMOJI_PATTERN =
  /^(#{1,6}\s+)(?:[\p{Extended_Pictographic}\u{FE0F}\u{200D}]+\s*)+/gmu;
const LIST_EMOJI_PATTERN =
  /^(\s*(?:[-*+]|\d+\.)\s+)(?:[\p{Extended_Pictographic}\u{FE0F}\u{200D}]+\s*)+/gmu;
// A list of names only (Google Meet, Zoom…) reads better as chips.
const CHIP_ITEM_MAX_LENGTH = 28;
const BOLD_WRAPPER_PATTERN = /^\*\*(.+)\*\*$/;

const splitLede = (markdown: string) => {
  const body = stripLeadingMarkdownTitle(markdown)
    .replace(HEADING_EMOJI_PATTERN, '$1')
    .replace(LIST_EMOJI_PATTERN, '$1')
    .trimStart();
  const [firstBlock, ...rest] = body.split(/\n\s*\n/);
  const isParagraph =
    isDefined(firstBlock) && !/^(#|[-*+]\s|\d+\.\s|>|\||```)/.test(firstBlock);

  if (!isParagraph) {
    return { lede: undefined, body };
  }

  const lede = firstBlock.trim().replace(BOLD_WRAPPER_PATTERN, '$1');

  return { lede, body: rest.join('\n\n') };
};

type AppsStageAppStoryProps = {
  markdown: string;
  pastel: string;
};

export function AppsStageAppStory({
  markdown,
  pastel,
}: AppsStageAppStoryProps) {
  const { lede, body } = splitLede(markdown);

  return (
    <Story style={{ ['--apps-stage-pastel' as string]: pastel }}>
      {/* The opening line is markdown too (bold, links): rendered, not printed. */}
      {lede !== undefined && (
        <Markdown
          components={COMPONENTS}
          disallowedElements={['img']}
          remarkPlugins={[remarkGfm]}
        >
          {lede}
        </Markdown>
      )}
      <Markdown
        components={COMPONENTS}
        disallowedElements={['img']}
        remarkPlugins={[remarkGfm]}
      >
        {body}
      </Markdown>
    </Story>
  );
}
