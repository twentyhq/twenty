import { isNonEmptyString, isNumber, isString } from '@sniptt/guards';

import { parseJson } from '@/utils/parseJson';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';
import { isDefined } from '@/utils/validation';

import { type RichTextColor } from './rich-text-color.type';
import { RICH_TEXT_COLORS } from './rich-text-colors.constant';
import { type RichTextDocument } from './rich-text-document.type';
import { RICH_TEXT_INDENTABLE_NODE_TYPES } from './rich-text-indentable-node-types.constant';
import { RICH_TEXT_MAX_HEADING_LEVEL } from './rich-text-max-heading-level.constant';
import { RICH_TEXT_MAX_INDENT_LEVEL } from './rich-text-max-indent-level.constant';
import { RICH_TEXT_TEXT_ALIGNMENTS } from './rich-text-text-alignments.constant';
import { convertTextToTipTapNodes } from './convert-text-to-tiptap-nodes';
import { isStorableRichTextUrl } from './is-storable-rich-text-url';
import { TIPTAP_DOCUMENT_SCHEMA_VERSION } from './tiptap-document-schema-version';
import { type TipTapMark, TIPTAP_MARK_TYPES } from './tiptap-mark-types';
import { type TipTapNode } from './tiptap-node';
import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

type BlockNoteObject = Record<string, unknown>;

type BlockNoteColors = {
  textColor?: RichTextColor;
  backgroundColor?: RichTextColor;
};

type ListNodeType =
  | typeof TIPTAP_NODE_TYPES.BULLET_LIST
  | typeof TIPTAP_NODE_TYPES.ORDERED_LIST
  | typeof TIPTAP_NODE_TYPES.TASK_LIST;

const toObjects = (value: unknown): BlockNoteObject[] =>
  Array.isArray(value) ? value.filter(isPlainObject) : [];

const readProps = (blockNoteObject: BlockNoteObject): BlockNoteObject =>
  isPlainObject(blockNoteObject.props) ? blockNoteObject.props : {};

const readColor = (value: unknown): RichTextColor | undefined =>
  RICH_TEXT_COLORS.find((color) => color === value);

const readTextAlign = (value: unknown) =>
  RICH_TEXT_TEXT_ALIGNMENTS.find(
    (textAlignment) => textAlignment !== 'left' && textAlignment === value,
  );

const readBlockColors = (props: BlockNoteObject): BlockNoteColors => ({
  textColor: readColor(props.textColor),
  backgroundColor: readColor(props.backgroundColor),
});

const createNode = ({ type, attrs, content }: TipTapNode): TipTapNode => {
  const node: TipTapNode = { type };

  if (isDefined(attrs)) {
    node.attrs = attrs;
  }

  if (isDefined(content) && content.length > 0) {
    node.content = content;
  }

  return node;
};

const convertStylesToMarks = ({
  styles,
  inheritedColors,
  isInsideLink,
}: {
  styles: BlockNoteObject;
  inheritedColors: BlockNoteColors;
  isInsideLink: boolean;
}): TipTapMark[] => {
  if (styles.code === true && !isInsideLink) {
    return [{ type: TIPTAP_MARK_TYPES.CODE }];
  }

  const marks: TipTapMark[] = [];

  if (styles.bold === true) {
    marks.push({ type: TIPTAP_MARK_TYPES.BOLD });
  }

  if (styles.italic === true) {
    marks.push({ type: TIPTAP_MARK_TYPES.ITALIC });
  }

  if (styles.underline === true) {
    marks.push({ type: TIPTAP_MARK_TYPES.UNDERLINE });
  }

  if (styles.strike === true) {
    marks.push({ type: TIPTAP_MARK_TYPES.STRIKE });
  }

  const textColor = readColor(styles.textColor) ?? inheritedColors.textColor;
  const backgroundColor =
    readColor(styles.backgroundColor) ?? inheritedColors.backgroundColor;

  if (isDefined(textColor) || isDefined(backgroundColor)) {
    marks.push({
      type: TIPTAP_MARK_TYPES.TEXT_STYLE,
      attrs: {
        textColor: textColor ?? null,
        backgroundColor: backgroundColor ?? null,
      },
    });
  }

  return marks;
};

const convertStyledText = ({
  styledText,
  inheritedColors,
  linkHref,
}: {
  styledText: BlockNoteObject;
  inheritedColors: BlockNoteColors;
  linkHref?: string;
}): TipTapNode[] => {
  if (!isString(styledText.text)) {
    return [];
  }

  const marks = convertStylesToMarks({
    styles: isPlainObject(styledText.styles) ? styledText.styles : {},
    inheritedColors,
    isInsideLink: isDefined(linkHref),
  });

  if (isDefined(linkHref)) {
    marks.push({ type: TIPTAP_MARK_TYPES.LINK, attrs: { href: linkHref } });
  }

  return convertTextToTipTapNodes(styledText.text, marks);
};

const createMentionTagNode = (props: BlockNoteObject): TipTapNode => ({
  type: TIPTAP_NODE_TYPES.MENTION_TAG,
  attrs: {
    recordId: isString(props.recordId) ? props.recordId : null,
    objectNameSingular: isString(props.objectNameSingular)
      ? props.objectNameSingular
      : null,
    label: isString(props.label) ? props.label : '',
    imageUrl: isString(props.imageUrl) ? props.imageUrl : '',
  },
});

const convertInlineItem = (
  inlineItem: BlockNoteObject,
  inheritedColors: BlockNoteColors,
): TipTapNode[] => {
  switch (inlineItem.type) {
    case 'text':
      return convertStyledText({ styledText: inlineItem, inheritedColors });
    case 'link': {
      const linkHref = isStorableRichTextUrl(inlineItem.href)
        ? inlineItem.href
        : undefined;
      const linkContent = isString(inlineItem.content)
        ? [{ type: 'text', text: inlineItem.content }]
        : toObjects(inlineItem.content);

      return linkContent.flatMap((styledText) =>
        convertStyledText({ styledText, inheritedColors, linkHref }),
      );
    }
    case 'mention':
      return [createMentionTagNode(readProps(inlineItem))];
    default:
      return [];
  }
};

const convertInlineContent = ({
  content,
  inheritedColors,
}: {
  content: unknown;
  inheritedColors: BlockNoteColors;
}): TipTapNode[] =>
  isString(content)
    ? convertStyledText({ styledText: { text: content }, inheritedColors })
    : toObjects(content).flatMap((inlineItem) =>
        convertInlineItem(inlineItem, inheritedColors),
      );

const createParagraphNode = (block: BlockNoteObject): TipTapNode => {
  const props = readProps(block);
  const textAlign = readTextAlign(props.textAlignment);

  return createNode({
    type: TIPTAP_NODE_TYPES.PARAGRAPH,
    attrs: isDefined(textAlign) ? { textAlign } : undefined,
    content: convertInlineContent({
      content: block.content,
      inheritedColors: readBlockColors(props),
    }),
  });
};

const createHeadingNode = (block: BlockNoteObject): TipTapNode => {
  const props = readProps(block);
  const textAlign = readTextAlign(props.textAlignment);
  const level = isNumber(props.level)
    ? Math.min(
        Math.max(Math.trunc(props.level), 1),
        RICH_TEXT_MAX_HEADING_LEVEL,
      )
    : 1;

  return createNode({
    type: TIPTAP_NODE_TYPES.HEADING,
    attrs: isDefined(textAlign) ? { level, textAlign } : { level },
    content: convertInlineContent({
      content: block.content,
      inheritedColors: readBlockColors(props),
    }),
  });
};

const createCodeBlockNode = (block: BlockNoteObject): TipTapNode => {
  const props = readProps(block);
  const code = convertInlineContent({
    content: block.content,
    inheritedColors: {},
  })
    .map((node) =>
      node.type === TIPTAP_NODE_TYPES.HARD_BREAK ? '\n' : (node.text ?? ''),
    )
    .join('');

  return createNode({
    type: TIPTAP_NODE_TYPES.CODE_BLOCK,
    attrs: {
      language: isNonEmptyString(props.language) ? props.language : null,
    },
    content:
      code.length > 0 ? [{ type: TIPTAP_NODE_TYPES.TEXT, text: code }] : [],
  });
};

const readTableCell = (cell: unknown): BlockNoteObject => {
  if (Array.isArray(cell)) {
    return { content: cell };
  }

  return isPlainObject(cell) ? cell : {};
};

const readSpan = (value: unknown): number =>
  isNumber(value) && Number.isInteger(value) && value > 1 ? value : 1;

const createTableCellNode = ({
  cell,
  isHeader,
  columnWidth,
}: {
  cell: unknown;
  isHeader: boolean;
  columnWidth: unknown;
}): TipTapNode => {
  const tableCell = readTableCell(cell);
  const props = readProps(tableCell);
  const colspan = readSpan(props.colspan);

  return {
    type: isHeader
      ? TIPTAP_NODE_TYPES.TABLE_HEADER
      : TIPTAP_NODE_TYPES.TABLE_CELL,
    attrs: {
      colspan,
      rowspan: readSpan(props.rowspan),
      colwidth: colspan === 1 && isNumber(columnWidth) ? [columnWidth] : null,
    },
    content: [createParagraphNode(tableCell)],
  };
};

const createTableNodes = (tableContent: unknown): TipTapNode[] => {
  if (!isPlainObject(tableContent)) {
    return [];
  }

  const headerRowCount = isNumber(tableContent.headerRows)
    ? tableContent.headerRows
    : 0;
  const headerColumnCount = isNumber(tableContent.headerCols)
    ? tableContent.headerCols
    : 0;
  const columnWidths: unknown[] = Array.isArray(tableContent.columnWidths)
    ? tableContent.columnWidths
    : [];

  const rows = toObjects(tableContent.rows)
    .map((row, rowIndex) => {
      const cells: unknown[] = Array.isArray(row.cells) ? row.cells : [];

      return {
        type: TIPTAP_NODE_TYPES.TABLE_ROW,
        content: cells.map((cell, columnIndex) =>
          createTableCellNode({
            cell,
            isHeader:
              rowIndex < headerRowCount || columnIndex < headerColumnCount,
            columnWidth: columnWidths[columnIndex],
          }),
        ),
      };
    })
    .filter((row) => row.content.length > 0);

  return rows.length > 0
    ? [{ type: TIPTAP_NODE_TYPES.TABLE, content: rows }]
    : [];
};

const createImageNodes = (props: BlockNoteObject): TipTapNode[] => {
  if (!isStorableRichTextUrl(props.url)) {
    return [];
  }

  return [
    {
      type: TIPTAP_NODE_TYPES.IMAGE,
      attrs: {
        src: props.url,
        alt: isNonEmptyString(props.name) ? props.name : null,
        title: isNonEmptyString(props.caption) ? props.caption : null,
        width: isNumber(props.previewWidth) ? props.previewWidth : null,
      },
    },
  ];
};

const createFileNodes = (props: BlockNoteObject): TipTapNode[] =>
  isStorableRichTextUrl(props.url)
    ? [
        {
          type: TIPTAP_NODE_TYPES.FILE,
          attrs: {
            url: props.url,
            name: isNonEmptyString(props.name) ? props.name : null,
          },
        },
      ]
    : [];

const convertBlockContent = (block: BlockNoteObject): TipTapNode[] => {
  switch (block.type) {
    case 'paragraph':
      return [createParagraphNode(block)];
    case 'heading':
      return [createHeadingNode(block)];
    case 'quote':
      return [
        {
          type: TIPTAP_NODE_TYPES.BLOCKQUOTE,
          content: [createParagraphNode(block)],
        },
      ];
    case 'codeBlock':
      return [createCodeBlockNode(block)];
    case 'divider':
      return [{ type: TIPTAP_NODE_TYPES.DIVIDER }];
    case 'table':
      return createTableNodes(block.content);
    case 'image':
      return createImageNodes(readProps(block));
    case 'file':
    case 'video':
    case 'audio':
      return createFileNodes(readProps(block));
    default:
      return isDefined(block.content) ? [createParagraphNode(block)] : [];
  }
};

const indentNode = ({
  node,
  indent,
}: {
  node: TipTapNode;
  indent: number;
}): TipTapNode =>
  indent > 0 && RICH_TEXT_INDENTABLE_NODE_TYPES.includes(node.type)
    ? {
        ...node,
        attrs: {
          ...node.attrs,
          indent: Math.min(indent, RICH_TEXT_MAX_INDENT_LEVEL),
        },
      }
    : node;

const getToggleSummaryNode = (
  block: BlockNoteObject,
): TipTapNode | undefined => {
  switch (block.type) {
    case 'toggleListItem':
      return createParagraphNode(block);
    case 'heading':
      return readProps(block).isToggleable === true
        ? createHeadingNode(block)
        : undefined;
    default:
      return undefined;
  }
};

const getListNodeType = (blockType: unknown): ListNodeType | undefined => {
  switch (blockType) {
    case 'bulletListItem':
      return TIPTAP_NODE_TYPES.BULLET_LIST;
    case 'numberedListItem':
      return TIPTAP_NODE_TYPES.ORDERED_LIST;
    case 'checkListItem':
      return TIPTAP_NODE_TYPES.TASK_LIST;
    default:
      return undefined;
  }
};

const createListNode = ({
  listNodeType,
  firstItemProps,
}: {
  listNodeType: ListNodeType;
  firstItemProps: BlockNoteObject;
}): TipTapNode => {
  const start = isNumber(firstItemProps.start)
    ? Math.max(Math.trunc(firstItemProps.start), 1)
    : 1;

  return listNodeType === TIPTAP_NODE_TYPES.ORDERED_LIST && start !== 1
    ? { type: listNodeType, attrs: { start }, content: [] }
    : { type: listNodeType, content: [] };
};

const createListItemNode = ({
  block,
  listNodeType,
}: {
  block: BlockNoteObject;
  listNodeType: ListNodeType;
}): TipTapNode => {
  const content = [
    createParagraphNode(block),
    ...convertBlocks({ blocks: block.children }),
  ];

  return listNodeType === TIPTAP_NODE_TYPES.TASK_LIST
    ? {
        type: TIPTAP_NODE_TYPES.TASK_ITEM,
        attrs: { checked: readProps(block).checked === true },
        content,
      }
    : { type: TIPTAP_NODE_TYPES.LIST_ITEM, content };
};

const convertBlocks = ({
  blocks,
  indent = 0,
}: {
  blocks: unknown;
  indent?: number;
}): TipTapNode[] => {
  const nodes: TipTapNode[] = [];
  let currentListNode: TipTapNode | undefined;

  for (const block of toObjects(blocks)) {
    const listNodeType = getListNodeType(block.type);

    if (!isDefined(listNodeType)) {
      currentListNode = undefined;

      const toggleSummaryNode = getToggleSummaryNode(block);

      if (isDefined(toggleSummaryNode)) {
        nodes.push(
          indentNode({
            node: {
              type: TIPTAP_NODE_TYPES.TOGGLE,
              attrs: { id: isNonEmptyString(block.id) ? block.id : null },
              content: [
                toggleSummaryNode,
                ...convertBlocks({ blocks: block.children }),
              ],
            },
            indent,
          }),
        );
        continue;
      }

      nodes.push(
        ...convertBlockContent(block).map((node) =>
          indentNode({ node, indent }),
        ),
        ...convertBlocks({ blocks: block.children, indent: indent + 1 }),
      );
      continue;
    }

    const props = readProps(block);
    const restartsNumbering =
      listNodeType === TIPTAP_NODE_TYPES.ORDERED_LIST && isNumber(props.start);

    if (currentListNode?.type !== listNodeType || restartsNumbering) {
      currentListNode = indentNode({
        node: createListNode({ listNodeType, firstItemProps: props }),
        indent,
      });
      nodes.push(currentListNode);
    }

    currentListNode.content?.push(createListItemNode({ block, listNodeType }));
  }

  return nodes;
};

export const convertBlockNoteToRichTextDocument = (
  serializedBlockNote: string,
): RichTextDocument | undefined => {
  const blocks = parseJson<unknown>(serializedBlockNote);

  if (!Array.isArray(blocks)) {
    return undefined;
  }

  const content = convertBlocks({ blocks });

  return {
    type: TIPTAP_NODE_TYPES.DOCUMENT,
    attrs: { schemaVersion: TIPTAP_DOCUMENT_SCHEMA_VERSION },
    content:
      content.length > 0 ? content : [{ type: TIPTAP_NODE_TYPES.PARAGRAPH }],
  };
};
