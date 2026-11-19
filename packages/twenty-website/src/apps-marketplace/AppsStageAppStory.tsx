import { styled } from '@linaria/react';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { isDefined } from 'twenty-shared/utils';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { ExternalLink } from '@/ui';

import { stripLeadingMarkdownTitle } from './strip-leading-markdown-title';

// PROTOTYPE (?direction=e): an app's README set the way the site writes, as on
// /why-twenty: the opening line as a light serif heading, each section opened
// by an eyebrow after a hairline, body copy at the site's small body size,
// lists as ruled rows. The README is the source; only its setting changes.
const Story = styled.div`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  ${typeRampDeclarations('bodySm')}

  & > * + * {
    margin-top: ${spacing(4)};
  }

  & p {
    max-width: 640px;
  }

  & h2,
  & h3 {
    align-items: center;
    color: ${semanticColor.ink};
    display: flex;
    font-family: ${fontFamily('sans')};
    font-size: ${fontSize(4.5)};
    font-weight: ${FONT_WEIGHT.medium};
    gap: ${spacing(2)};
    letter-spacing: -0.04em;
    line-height: 24px;
  }

  /* The eyebrow's marker, in the app's category colour. */
  & h2::before {
    background-color: var(--apps-stage-pastel, ${color('blue')});
    border-radius: 1px;
    content: '';
    flex-shrink: 0;
    height: 7px;
    width: 14px;
  }

  & > h2 {
    border-top: 1px solid ${semanticColor.line};
    margin-top: ${spacing(12)};
    padding-top: ${spacing(10)};
  }

  & > h2 + * {
    margin-top: ${spacing(5)};
  }

  & > h3 {
    font-size: ${fontSize(4)};
    margin-top: ${spacing(8)};
  }

  & strong {
    color: ${semanticColor.ink};
    font-weight: ${FONT_WEIGHT.medium};
  }

  & ul,
  & ol {
    border-bottom: 1px solid ${semanticColor.line};
    list-style: none;
    max-width: 640px;
    padding: 0;
  }

  & li {
    border-top: 1px solid ${semanticColor.line};
    padding-block: ${spacing(3)};
  }

  & ol {
    counter-reset: apps-stage-story;
  }

  /* The number sits in the gutter; the item's text flows as one line box. */
  & ol > li {
    counter-increment: apps-stage-story;
    padding-left: ${spacing(10)};
    position: relative;
  }

  & ol > li::before {
    color: ${semanticColor.inkSubtle};
    content: counter(apps-stage-story, decimal-leading-zero);
    font-family: ${fontFamily('mono')};
    font-size: ${fontSize(3)};
    left: 0;
    position: absolute;
    top: calc(${spacing(3)} + 2px);
  }

  & li > p + p {
    margin-top: ${spacing(2)};
  }

  & code {
    background-color: ${color('white-5')};
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

  /* A README note (a caveat, a plan limit): a quiet panel, not a quote. */
  & blockquote {
    background-color: ${color('white-5')};
    border-radius: ${radius(2)};
    font-size: ${fontSize(3.5)};
    line-height: 1.55;
    max-width: 640px;
    padding: ${spacing(4)} ${spacing(5)};
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
    border-bottom: none;
    display: flex;
    flex-wrap: wrap;
    gap: ${spacing(2)};
    max-width: none;
  }

  && > li {
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

const Lede = styled.p`
  color: ${color('neutral')};
  font-family: ${fontFamily('serif')};
  font-size: ${fontSize(6.5)};
  font-weight: ${FONT_WEIGHT.light};
  letter-spacing: -0.02em;
  line-height: 1.25;
  max-width: 640px;
  text-wrap: balance;

  ${mediaUp('md')} {
    font-size: ${fontSize(8)};
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
      {lede !== undefined && <Lede>{lede}</Lede>}
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
