import { z } from 'zod';

type TipTapNodeShape = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNodeShape[];
};

const tipTapNodeSchema: z.ZodType<TipTapNodeShape> = z.lazy(() =>
  z
    .object({
      type: z.string().min(1),
      text: z.string().optional(),
      attrs: z.record(z.string(), z.unknown()).optional(),
      marks: z.array(z.looseObject({ type: z.string() })).optional(),
      content: z.array(tipTapNodeSchema).optional(),
    })
    .loose(),
);

// bodyTemplate is a plain TEXT column, so anything can reach it through the
// record API. The renderer recurses over content without checking shapes, so
// a malformed node would otherwise throw mid-send, per recipient.
export const tipTapDocumentSchema = z
  .object({
    type: z.literal('doc'),
    attrs: z.record(z.string(), z.unknown()).optional(),
    content: z.array(tipTapNodeSchema).optional(),
  })
  .loose();
