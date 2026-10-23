import { isNonEmptyString } from '@sniptt/guards';
import { z } from 'zod';

import { isSafeUrl } from '@/utils/url/isSafeUrl';

import { RICH_TEXT_COLORS } from './rich-text-colors.constant';
import { RICH_TEXT_MAX_HEADING_LEVEL } from './rich-text-max-heading-level.constant';
import { RICH_TEXT_MAX_INDENT_LEVEL } from './rich-text-max-indent-level.constant';
import { RICH_TEXT_TEXT_ALIGNMENTS } from './rich-text-text-alignments.constant';
import { RICH_TEXT_URL_MAX_LENGTH } from './rich-text-url-max-length.constant';
import { TIPTAP_DOCUMENT_SCHEMA_VERSION } from './tiptap-document-schema-version';
import { TIPTAP_MARK_TYPES } from './tiptap-mark-types';
import { type TipTapNode } from './tiptap-node';
import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

const textAlignAttributeSchema = z
  .enum(RICH_TEXT_TEXT_ALIGNMENTS)
  .nullable()
  .optional();

const colorAttributeSchema = z.enum(RICH_TEXT_COLORS).nullable().optional();

const indentAttributeSchema = z
  .int()
  .min(0)
  .max(RICH_TEXT_MAX_INDENT_LEVEL)
  .nullable()
  .optional();

const indentAttributesSchema = z
  .looseObject({ indent: indentAttributeSchema })
  .optional();

const urlSchema = z
  .string()
  .max(RICH_TEXT_URL_MAX_LENGTH)
  .refine((url) => !isNonEmptyString(url.trim()) || isSafeUrl(url.trim()), {
    message: 'Dangerous URL protocol',
  });

const markSchema = z.discriminatedUnion('type', [
  z.looseObject({ type: z.literal(TIPTAP_MARK_TYPES.BOLD) }),
  z.looseObject({ type: z.literal(TIPTAP_MARK_TYPES.ITALIC) }),
  z.looseObject({ type: z.literal(TIPTAP_MARK_TYPES.UNDERLINE) }),
  z.looseObject({ type: z.literal(TIPTAP_MARK_TYPES.STRIKE) }),
  z.looseObject({ type: z.literal(TIPTAP_MARK_TYPES.CODE) }),
  z.looseObject({
    type: z.literal(TIPTAP_MARK_TYPES.LINK),
    attrs: z.looseObject({ href: urlSchema }),
  }),
  z.looseObject({
    type: z.literal(TIPTAP_MARK_TYPES.TEXT_STYLE),
    attrs: z.looseObject({
      textColor: colorAttributeSchema,
      backgroundColor: colorAttributeSchema,
    }),
  }),
]);

const textNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.TEXT),
  text: z.string().min(1),
  marks: z.array(markSchema).optional(),
});

const hardBreakNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.HARD_BREAK),
});

const mentionTagNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.MENTION_TAG),
  attrs: z.looseObject({
    recordId: z.string().nullable(),
    objectNameSingular: z.string().nullable(),
    label: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
  }),
});

const inlineNodeSchema = z.discriminatedUnion('type', [
  textNodeSchema,
  hardBreakNodeSchema,
  mentionTagNodeSchema,
]);

const blockContentSchema = z.array(
  z.lazy((): z.ZodType<TipTapNode> => blockNodeSchema),
);

const paragraphNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.PARAGRAPH),
  attrs: z
    .looseObject({
      textAlign: textAlignAttributeSchema,
      indent: indentAttributeSchema,
    })
    .optional(),
  content: z.array(inlineNodeSchema).optional(),
});

const headingNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.HEADING),
  attrs: z.looseObject({
    level: z.int().min(1).max(RICH_TEXT_MAX_HEADING_LEVEL),
    textAlign: textAlignAttributeSchema,
    indent: indentAttributeSchema,
  }),
  content: z.array(inlineNodeSchema).optional(),
});

const listItemNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.LIST_ITEM),
  content: blockContentSchema.min(1),
});

const bulletListNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.BULLET_LIST),
  attrs: indentAttributesSchema,
  content: z.array(listItemNodeSchema).min(1),
});

const orderedListNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.ORDERED_LIST),
  attrs: z
    .looseObject({ start: z.int().optional(), indent: indentAttributeSchema })
    .optional(),
  content: z.array(listItemNodeSchema).min(1),
});

const taskItemNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.TASK_ITEM),
  attrs: z.looseObject({ checked: z.boolean() }),
  content: blockContentSchema.min(1),
});

const taskListNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.TASK_LIST),
  attrs: indentAttributesSchema,
  content: z.array(taskItemNodeSchema).min(1),
});

const blockquoteNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.BLOCKQUOTE),
  attrs: indentAttributesSchema,
  content: blockContentSchema.min(1),
});

const toggleNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.TOGGLE),
  attrs: z
    .looseObject({
      id: z.string().nullable().optional(),
      indent: indentAttributeSchema,
    })
    .optional(),
  content: z.tuple(
    [z.discriminatedUnion('type', [paragraphNodeSchema, headingNodeSchema])],
    z.lazy((): z.ZodType<TipTapNode> => blockNodeSchema),
  ),
});

const codeBlockNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.CODE_BLOCK),
  attrs: z
    .looseObject({
      language: z.string().nullable(),
      indent: indentAttributeSchema,
    })
    .optional(),
  content: z
    .array(
      z.looseObject({
        type: z.literal(TIPTAP_NODE_TYPES.TEXT),
        text: z.string().min(1),
      }),
    )
    .optional(),
});

const dividerNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.DIVIDER),
});

const imageNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.IMAGE),
  attrs: z.looseObject({
    src: urlSchema,
    href: urlSchema.nullable().optional(),
    alt: z.string().nullable().optional(),
    width: z.union([z.string(), z.number()]).nullable().optional(),
  }),
});

const fileNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.FILE),
  attrs: z.looseObject({
    url: urlSchema,
    name: z.string().nullable().optional(),
  }),
});

const tableCellAttributesSchema = z
  .looseObject({
    colspan: z.int().min(1).optional(),
    rowspan: z.int().min(1).optional(),
    colwidth: z.array(z.number()).nullable().optional(),
  })
  .optional();

const createTableCellNodeSchema = <
  TTableCellType extends
    | typeof TIPTAP_NODE_TYPES.TABLE_CELL
    | typeof TIPTAP_NODE_TYPES.TABLE_HEADER,
>(
  tableCellType: TTableCellType,
) =>
  z.looseObject({
    type: z.literal(tableCellType),
    attrs: tableCellAttributesSchema,
    content: blockContentSchema.min(1),
  });

const tableCellNodeSchema = createTableCellNodeSchema(
  TIPTAP_NODE_TYPES.TABLE_CELL,
);

const tableHeaderNodeSchema = createTableCellNodeSchema(
  TIPTAP_NODE_TYPES.TABLE_HEADER,
);

const tableRowNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.TABLE_ROW),
  content: z
    .array(
      z.discriminatedUnion('type', [
        tableCellNodeSchema,
        tableHeaderNodeSchema,
      ]),
    )
    .min(1),
});

const tableNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.TABLE),
  content: z.array(tableRowNodeSchema).min(1),
});

const blockNodeSchema = z.discriminatedUnion('type', [
  paragraphNodeSchema,
  headingNodeSchema,
  bulletListNodeSchema,
  orderedListNodeSchema,
  taskListNodeSchema,
  blockquoteNodeSchema,
  toggleNodeSchema,
  codeBlockNodeSchema,
  dividerNodeSchema,
  imageNodeSchema,
  fileNodeSchema,
  tableNodeSchema,
]);

export const richTextDocumentSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.DOCUMENT),
  attrs: z
    .looseObject({
      schemaVersion: z.literal(TIPTAP_DOCUMENT_SCHEMA_VERSION).optional(),
    })
    .optional(),
  content: blockContentSchema.optional(),
});
