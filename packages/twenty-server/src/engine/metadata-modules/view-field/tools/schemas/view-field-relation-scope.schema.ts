import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';
import {
  AggregateOperations,
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewSortDirection,
} from 'twenty-shared/types';
import { z } from 'zod';

const relationTargetFieldMetadataIdSchema = z
  .uuid()
  .optional()
  .describe(
    'When fieldMetadataId is a many-to-one relation of the related object, use this field of the record it points to, e.g. task > status on taskTargets.',
  );

export const viewFieldRelationScopeSchema = z
  .object({
    filters: z
      .array(
        z.object({
          id: z
            .uuid()
            .describe('Local id, used to place the filter in a group.'),
          fieldMetadataId: z.uuid().describe('A field of the related object.'),
          operand: z.enum(ViewFilterOperand),
          value: z.union([
            z.string(),
            z.array(z.string()),
            z.boolean(),
            z.number(),
            z.record(z.string(), z.unknown()),
          ]),
          subFieldName: z.string().optional(),
          relationTargetFieldMetadataId: relationTargetFieldMetadataIdSchema,
          filterGroupId: z.uuid().optional(),
        }),
      )
      .default([]),
    filterGroups: z
      .array(
        z.object({
          id: z.uuid(),
          parentFilterGroupId: z.uuid().optional(),
          logicalOperator: z.enum(ViewFilterGroupLogicalOperator),
        }),
      )
      .default([]),
    sorts: z
      .array(
        z.object({
          fieldMetadataId: z.uuid().describe('A field of the related object.'),
          direction: z.enum(ViewSortDirection),
          subFieldName: z.string().optional(),
          relationTargetFieldMetadataId: relationTargetFieldMetadataIdSchema,
        }),
      )
      .default([]),
    limit: z
      .number()
      .int()
      .min(1)
      .max(QUERY_MAX_RECORDS_FROM_RELATION)
      .optional(),
    aggregateOperation: z
      .enum(AggregateOperations)
      .nullable()
      .optional()
      .describe(
        'Show per row an aggregate of the related records the filters keep instead of the records, with no sorts and no limit. COUNT takes no relationTargetFieldMetadataId; SUM, AVG, MIN and MAX need relationTargetFieldMetadataId set to a related object field that supports the operation.',
      ),
  })
  .describe(
    'On an extra (non-canonical) column of a one-to-many relation field, the filters, sorts and limit applied to the related records, in the view filter and view sort shape, e.g. open tasks sorted by due date, first 1.',
  );
