import { parseTipTapJsonDocument } from './parse-tiptap-json-document';
import { type TipTapDocument } from './tiptap-document';
import { type TipTapMark, TIPTAP_MARK_TYPES } from './tiptap-mark-types';
import { TIPTAP_MARKS_RENDER_ORDER } from './tiptap-marks-render-order';
import { type TipTapNode } from './tiptap-node';
import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

const renderChildren = (node: TipTapNode): string =>
  (node.content ?? []).map(renderTipTapNodeToMarkdown).join('');

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

      return typeof href === 'string' ? `[${text}](${href})` : text;
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
    ? `[[record:${objectName}:${recordId}:${typeof label === 'string' ? label : ''}[[/record]]`
    : typeof label === 'string'
      ? `@${label}`
      : '';
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
        .reduce((text, mark) => applyMark(text, mark), node.text ?? '');
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
        .map((item) => `- ${renderChildren(item).trim()}\n`)
        .join('')}\n`;
    case TIPTAP_NODE_TYPES.ORDERED_LIST: {
      const start =
        typeof node.attrs?.start === 'number' ? node.attrs.start : 1;

      return `${(node.content ?? [])
        .map(
          (item, index) => `${start + index}. ${renderChildren(item).trim()}\n`,
        )
        .join('')}\n`;
    }
    case TIPTAP_NODE_TYPES.IMAGE: {
      const alt = typeof node.attrs?.alt === 'string' ? node.attrs.alt : '';
      const src = typeof node.attrs?.src === 'string' ? node.attrs.src : '';

      return src === '' ? alt : `![${alt}](${src})\n\n`;
    }
    case TIPTAP_NODE_TYPES.BUTTON: {
      const label = renderChildren(node);
      const href = node.attrs?.href;

      return `${typeof href === 'string' ? `[${label}](${href})` : label}\n\n`;
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
