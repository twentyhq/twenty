import { formatRecordReference } from '@/ai/utils/format-record-reference.util';

import { parseTipTapJsonDocument } from './parse-tiptap-json-document';
import { type TipTapDocument } from './tiptap-document';
import { type TipTapMark, TIPTAP_MARK_TYPES } from './tiptap-mark-types';
import { TIPTAP_MARKS_RENDER_ORDER } from './tiptap-marks-render-order';
import { type TipTapNode } from './tiptap-node';
import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

const renderChildren = (node: TipTapNode): string =>
  (node.content ?? []).map(renderTipTapNodeToMarkdown).join('');

const escapeMarkdownText = (text: string): string =>
  text
    .replace(/([\\`*_[\]{}<>~|#&])/g, '\\$1')
    .replace(/^(\s{0,3})>(?=\s|$)/gm, '$1\\>')
    .replace(/^(\s{0,3})-(?=-{2}|\s|$)/gm, '$1\\-')
    .replace(/^(\s{0,3})\+(?=\s|$)/gm, '$1\\+')
    .replace(/^(\s{0,3}\d+)([.)])(?=\s|$)/gm, '$1\\$2');

const MARKDOWN_DESTINATION_CHARACTER_ESCAPES: Readonly<Record<string, string>> =
  {
    '\\': '%5C',
    '(': '%28',
    ')': '%29',
    '<': '%3C',
    '>': '%3E',
  };

const escapeMarkdownDestination = (destination: string): string =>
  destination.replace(/[\\()<>\s]/g, (character) =>
    character in MARKDOWN_DESTINATION_CHARACTER_ESCAPES
      ? MARKDOWN_DESTINATION_CHARACTER_ESCAPES[character]
      : encodeURIComponent(character),
  );

const applyMark = (text: string, mark: TipTapMark): string => {
  switch (mark.type) {
    case TIPTAP_MARK_TYPES.BOLD:
      return `**${text}**`;
    case TIPTAP_MARK_TYPES.ITALIC:
      return `_${text}_`;
    case TIPTAP_MARK_TYPES.UNDERLINE:
      return `<u>${text}</u>`;
    case TIPTAP_MARK_TYPES.STRIKE:
      return `~~${text}~~`;
    case TIPTAP_MARK_TYPES.LINK: {
      const href = mark.attrs?.href;

      return typeof href === 'string'
        ? `[${text}](${escapeMarkdownDestination(href)})`
        : text;
    }
    default:
      return text;
  }
};

const renderMention = (node: TipTapNode): string => {
  const objectName = node.attrs?.objectNameSingular;
  const recordId = node.attrs?.recordId;
  const label = node.attrs?.label;

  return typeof objectName === 'string' && typeof recordId === 'string'
    ? formatRecordReference({
        objectNameSingular: objectName,
        recordId,
        displayName: typeof label === 'string' ? label : '',
      })
    : typeof label === 'string'
      ? `@${label}`
      : '';
};

const renderListItem = (item: TipTapNode, marker: string): string => {
  const [firstLine = '', ...continuationLines] = renderChildren(item)
    .trim()
    .split('\n');
  const indentation = ' '.repeat(marker.length);
  const indentedContinuation = continuationLines
    .map((line) => (line === '' ? '' : `${indentation}${line}`))
    .join('\n');

  return `${marker}${firstLine}${
    indentedContinuation === '' ? '' : `\n${indentedContinuation}`
  }\n`;
};

const renderTipTapNodeToMarkdown = (node: TipTapNode): string => {
  switch (node.type) {
    case TIPTAP_NODE_TYPES.TEXT:
      return [...(node.marks ?? [])]
        .sort(
          (firstMark, secondMark) =>
            TIPTAP_MARKS_RENDER_ORDER.indexOf(firstMark.type) -
            TIPTAP_MARKS_RENDER_ORDER.indexOf(secondMark.type),
        )
        .reduce(
          (text, mark) => applyMark(text, mark),
          escapeMarkdownText(node.text ?? ''),
        );
    case TIPTAP_NODE_TYPES.HARD_BREAK:
      return '\n';
    case TIPTAP_NODE_TYPES.VARIABLE_TAG:
      return typeof node.attrs?.variable === 'string'
        ? node.attrs.variable
        : '';
    case TIPTAP_NODE_TYPES.MENTION_TAG:
      return renderMention(node);
    case TIPTAP_NODE_TYPES.HEADING: {
      const level =
        typeof node.attrs?.level === 'number' ? node.attrs.level : 1;

      return `${'#'.repeat(Math.min(Math.max(level, 1), 6))} ${renderChildren(node)}\n\n`;
    }
    case TIPTAP_NODE_TYPES.PARAGRAPH:
      return `${renderChildren(node)}\n\n`;
    case TIPTAP_NODE_TYPES.BULLET_LIST:
      return `${(node.content ?? [])
        .map((item) => renderListItem(item, '- '))
        .join('')}\n`;
    case TIPTAP_NODE_TYPES.ORDERED_LIST: {
      const start =
        typeof node.attrs?.start === 'number' ? node.attrs.start : 1;

      return `${(node.content ?? [])
        .map((item, index) => renderListItem(item, `${start + index}. `))
        .join('')}\n`;
    }
    case TIPTAP_NODE_TYPES.IMAGE: {
      const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : '';
      const src = typeof node.attrs?.src === 'string' ? node.attrs.src : '';

      return src === ''
        ? escapeMarkdownText(alt)
        : `![${escapeMarkdownText(alt)}](${escapeMarkdownDestination(src)})\n\n`;
    }
    case TIPTAP_NODE_TYPES.BUTTON: {
      const label = renderChildren(node);
      const href = node.attrs?.href;

      return `${
        typeof href === 'string'
          ? `[${label}](${escapeMarkdownDestination(href)})`
          : label
      }\n\n`;
    }
    case TIPTAP_NODE_TYPES.HTML:
      return typeof node.attrs?.html === 'string' ? node.attrs.html : '';
    case TIPTAP_NODE_TYPES.DIVIDER:
      return '---\n\n';
    default:
      return renderChildren(node);
  }
};

export const tipTapDocumentToMarkdown = (
  document: string | TipTapDocument,
): string => {
  const parsedDocument =
    typeof document === 'string' ? parseTipTapJsonDocument(document) : document;

  if (parsedDocument === undefined) {
    return typeof document === 'string' ? document : '';
  }

  return renderTipTapNodeToMarkdown(parsedDocument).trim();
};
