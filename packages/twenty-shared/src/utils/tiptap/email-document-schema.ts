import { z } from 'zod';

import { type EmailDocumentNode } from './email-document-node';
import { EMAIL_DOCUMENT_SCHEMA_VERSION } from './email-document-schema-version';
import { TIPTAP_MARK_TYPES } from './tiptap-mark-types';
import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

// The versioned contract shared by every structured email surface. Campaigns
// are the first authoring integration; workflow and one-to-one email can use
// the same document without forking its schema or renderer. It is deliberately
// owned here rather than by the editor: node types are a closed set so an
// unknown block is rejected upfront instead of silently rendering as nothing,
// while attribute objects stay open so adding an attribute is not breaking.
// Style attributes are structured objects of camelCase CSS properties
// ({ backgroundColor: '#fff', paddingTop: '12px' }), applied directly to
// react-email components at render time. No CSS text is ever parsed.
const styleAttributeSchema = z
  .record(
    z
      .string()
      .regex(/^[a-zA-Z]+$/)
      .max(40),
    z.string().max(400),
  )
  .optional();

const markSchema = z.discriminatedUnion('type', [
  z.looseObject({ type: z.literal(TIPTAP_MARK_TYPES.BOLD) }),
  z.looseObject({ type: z.literal(TIPTAP_MARK_TYPES.ITALIC) }),
  z.looseObject({ type: z.literal(TIPTAP_MARK_TYPES.UNDERLINE) }),
  z.looseObject({ type: z.literal(TIPTAP_MARK_TYPES.STRIKE) }),
  z.looseObject({
    type: z.literal(TIPTAP_MARK_TYPES.LINK),
    attrs: z.looseObject({ href: z.string().max(4_000) }).optional(),
  }),
]);

const textNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.TEXT),
  text: z.string().min(1),
  marks: z.array(markSchema).optional(),
});

// The variable attribute holds the literal placeholder, e.g. "{{firstName}}".
const variableTagNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.VARIABLE_TAG),
  attrs: z.looseObject({ variable: z.string().nullable() }),
});

const hardBreakNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.HARD_BREAK),
});

const inlineNodeSchema = z.discriminatedUnion('type', [
  textNodeSchema,
  variableTagNodeSchema,
  hardBreakNodeSchema,
]);

const blockContentSchema = z.array(
  z.lazy((): z.ZodType<EmailDocumentNode> => blockNodeSchema),
);

const paragraphNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.PARAGRAPH),
  attrs: z.looseObject({}).optional(),
  content: z.array(inlineNodeSchema).optional(),
});

const headingNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.HEADING),
  attrs: z.looseObject({
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  }),
  content: z.array(inlineNodeSchema).optional(),
});

const listItemNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.LIST_ITEM),
  attrs: z.looseObject({}).optional(),
  content: blockContentSchema.min(1),
});

const bulletListNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.BULLET_LIST),
  attrs: z.looseObject({}).optional(),
  content: z.array(listItemNodeSchema).min(1),
});

const orderedListNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.ORDERED_LIST),
  attrs: z.looseObject({}).optional(),
  content: z.array(listItemNodeSchema).min(1),
});

const imageNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.IMAGE),
  attrs: z.looseObject({
    // Uploaded images retain their workspace file identity for ownership,
    // lifecycle and future URL resolution. External images have no fileId.
    fileId: z.uuid().nullable().optional(),
    src: z.string().max(4_000),
    alt: z.string().nullable().optional(),
    title: z.string().nullable().optional(),
    align: z.string().nullable().optional(),
    width: z.union([z.string(), z.number()]).nullable().optional(),
    href: z.string().max(4_000).nullable().optional(),
  }),
});

const sectionNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.SECTION),
  attrs: z.looseObject({ style: styleAttributeSchema }),
  content: blockContentSchema.min(1),
});

const columnNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.COLUMN),
  attrs: z.looseObject({ style: styleAttributeSchema }),
  content: blockContentSchema.min(1),
});

const columnsNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.COLUMNS),
  attrs: z.looseObject({ style: styleAttributeSchema }),
  content: z.array(columnNodeSchema).min(2).max(4),
});

// Buttons forbid marks and atoms in the editor schema, so plain text only.
const buttonNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.BUTTON),
  attrs: z.looseObject({
    href: z.string().max(4_000).nullable(),
    style: styleAttributeSchema,
  }),
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
  attrs: z.looseObject({ style: styleAttributeSchema }),
});

const htmlNodeSchema = z.looseObject({
  type: z.literal(TIPTAP_NODE_TYPES.HTML),
  attrs: z.looseObject({ html: z.string().max(100_000) }),
});

const blockNodeSchema = z.discriminatedUnion('type', [
  paragraphNodeSchema,
  headingNodeSchema,
  bulletListNodeSchema,
  orderedListNodeSchema,
  imageNodeSchema,
  sectionNodeSchema,
  columnsNodeSchema,
  buttonNodeSchema,
  dividerNodeSchema,
  htmlNodeSchema,
]);

const canvasThemeAttributeSchema = z.looseObject({
  pageBackground: z.string().optional(),
  pagePadding: z.string().optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  bodyBackground: z.string().optional(),
  textColor: z.string().optional(),
  width: z.string().optional(),
  padding: z.string().optional(),
  cornerRadius: z.string().optional(),
  borderWidth: z.string().optional(),
  borderColor: z.string().optional(),
});

// schemaVersion is absent on documents saved before versioning was introduced;
// those are version 1. A document from a future version is rejected rather
// than rendered wrong.
export const emailDocumentSchema = z.looseObject({
  type: z.literal('doc'),
  attrs: z
    .looseObject({
      schemaVersion: z
        .int()
        .min(1)
        .max(EMAIL_DOCUMENT_SCHEMA_VERSION)
        .optional(),
      canvasTheme: canvasThemeAttributeSchema.nullable().optional(),
    })
    .optional(),
  content: blockContentSchema.optional(),
});

export type EmailDocument = z.infer<typeof emailDocumentSchema>;
