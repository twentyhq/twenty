import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import {
  AggregateOperations,
  ViewCalendarLayout,
  ViewFilterOperand,
  ViewSortDirection,
  ViewVisibility,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { CREATABLE_VIEW_TYPES } from 'src/engine/metadata-modules/view/tools/constants/creatable-view-types.constant';
import { CompleteViewUpsertService } from 'src/engine/metadata-modules/view/tools/services/complete-view-upsert.service';
import { ViewToolAccessService } from 'src/engine/metadata-modules/view/tools/services/view-tool-access.service';
import { ViewToolIdentifierService } from 'src/engine/metadata-modules/view/tools/services/view-tool-identifier.service';

const fieldReferenceShape = {
  fieldName: z
    .string()
    .optional()
    .describe(
      'Field name (e.g. "amount", "stage"). Resolved to a UUID server-side. Provide this or fieldMetadataId.',
    ),
  fieldMetadataId: z
    .uuid()
    .optional()
    .describe(
      'Field UUID. Alternative to fieldName; takes precedence when both are given.',
    ),
};

const upsertCompleteViewFieldSchema = z.object({
  ...fieldReferenceShape,
  isVisible: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether the column is visible. Defaults to true.'),
  size: z
    .number()
    .int()
    .optional()
    .default(150)
    .describe('Column width. Defaults to 150.'),
});

const upsertCompleteViewFilterSchema = z.object({
  ...fieldReferenceShape,
  operand: z
    .enum(ViewFilterOperand)
    .describe(
      'Filter operator. Must be valid for the field type (e.g. SELECT: IS, IS_NOT; CURRENCY: GREATER_THAN_OR_EQUAL, LESS_THAN_OR_EQUAL; TEXT: CONTAINS).',
    ),
  value: z
    .union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(z.string()),
      z.record(z.string(), z.unknown()),
    ])
    .describe(
      'Filter value. Array of option values for SELECT/MULTI_SELECT (e.g. ["WON"]), number for NUMBER/CURRENCY, "" for IS_EMPTY/IS_NOT_EMPTY.',
    ),
  subFieldName: z
    .string()
    .optional()
    .describe(
      'Required for composite fields (e.g. "amountMicros" for CURRENCY, "addressCity" for ADDRESS, "firstName" for FULL_NAME).',
    ),
});

const upsertCompleteViewSortSchema = z.object({
  ...fieldReferenceShape,
  direction: z
    .enum(ViewSortDirection)
    .optional()
    .default(ViewSortDirection.ASC)
    .describe('Sort direction: ASC or DESC. Defaults to ASC.'),
});

const upsertCompleteViewInputSchema = z.object({
  id: z
    .uuid()
    .optional()
    .describe('View ID to update. Omit to create a new view.'),
  objectNameSingular: z
    .string()
    .optional()
    .describe(
      'Object name this view is for (e.g. "opportunity"). Required when creating (no id); ignored when id is given.',
    ),
  name: z.string().optional().describe('View name'),
  icon: z.string().optional().describe('Icon identifier (e.g. "IconList")'),
  type: z
    .enum(CREATABLE_VIEW_TYPES)
    .optional()
    .describe(
      'View type. Defaults to TABLE on create. Use the *_WIDGET variants for views backing a dashboard widget so they stay out of record index view pickers.',
    ),
  visibility: z
    .enum([ViewVisibility.WORKSPACE, ViewVisibility.UNLISTED])
    .optional()
    .describe(
      'View visibility. Defaults to WORKSPACE on create, which is almost always the best fit — it makes the view visible to everyone and is REQUIRED for any view backing a dashboard widget. Only set UNLISTED for a private, personal view a specific user explicitly asked for, AND only when a user identity is available. An UNLISTED view created without an owner is invisible to everyone (its dashboard widget renders blank), so never use UNLISTED for widget-backing views.',
    ),
  mainGroupByFieldName: z
    .string()
    .optional()
    .describe(
      'Field name to group by (required for KANBAN, must be a SELECT field, e.g. "stage").',
    ),
  kanbanAggregateOperation: z
    .enum(AggregateOperations)
    .optional()
    .describe('Aggregate operation for kanban columns (e.g. "SUM", "COUNT").'),
  kanbanAggregateOperationFieldName: z
    .string()
    .optional()
    .describe('Field name for the kanban aggregate operation (e.g. "amount").'),
  calendarLayout: z
    .enum([
      ViewCalendarLayout.DAY,
      ViewCalendarLayout.WEEK,
      ViewCalendarLayout.MONTH,
    ])
    .optional()
    .describe('Calendar layout (required for CALENDAR).'),
  calendarFieldName: z
    .string()
    .optional()
    .describe(
      'Date field name for the calendar (required for CALENDAR, must be DATE or DATE_TIME).',
    ),
  calendarEndFieldName: z
    .string()
    .optional()
    .describe(
      'Optional end date field name for the calendar. It must match the type of calendarFieldName.',
    ),
  fields: z
    .array(upsertCompleteViewFieldSchema)
    .optional()
    .describe(
      'Declarative list of columns, in display order. Provided array REPLACES all existing fields; [] clears them; omit to leave untouched.',
    ),
  filters: z
    .array(upsertCompleteViewFilterSchema)
    .optional()
    .describe(
      'Declarative list of filters. Provided array REPLACES all existing filters; [] clears them; omit to leave untouched.',
    ),
  sorts: z
    .array(upsertCompleteViewSortSchema)
    .optional()
    .describe(
      'Declarative list of sorts. Provided array REPLACES all existing sorts; [] clears them; omit to leave untouched.',
    ),
});

@DefineTool({
  name: 'upsert_complete_view',
  category: ToolCategory.VIEW,
  requiredPermissionFlags: [PermissionFlagType.VIEWS],
  description: `Create or update a complete view — the view plus its fields (columns), filters, and sorts — in a single call.

IDENTITY: Omit "id" to CREATE a new view (requires objectNameSingular). Provide "id" to UPDATE an existing view.

FIELD REFERENCES: In fields/filters/sorts you can reference a field by NAME (fieldName, e.g. "amount") or by UUID (fieldMetadataId). Names are resolved server-side, so you usually do NOT need get_field_metadata first. UUID wins when both are given.

DECLARATIVE CHILDREN (replace semantics): fields, filters, and sorts each describe the FULL desired set.
- A provided array REPLACES all existing entries of that kind (existing ones are deleted, the new ones created in order).
- An empty array [] CLEARS all entries of that kind.
- Omitting the key leaves existing entries untouched.
This means you never need to fetch child ids to edit a view — just pass the desired end state. For surgical single-entry edits, the granular tools (create_view_filter, update_view_sort, etc.) remain available.

VIEW TYPES: TABLE (default), LIST, KANBAN (requires mainGroupByFieldName, a SELECT field), CALENDAR (requires calendarFieldName + calendarLayout).`,
})
export class UpsertCompleteViewTool extends BaseTool<
  typeof upsertCompleteViewInputSchema
> {
  readonly inputSchema = upsertCompleteViewInputSchema;

  constructor(
    private readonly completeViewUpsertService: CompleteViewUpsertService,
    private readonly viewToolAccessService: ViewToolAccessService,
    private readonly viewToolIdentifierService: ViewToolIdentifierService,
  ) {
    super();
  }

  async execute({
    input,
    context: { workspaceId, userWorkspaceId },
  }: ToolExecuteArgs<
    typeof upsertCompleteViewInputSchema
  >): Promise<ToolOutput> {
    const existingView = isDefined(input.id)
      ? await this.viewToolAccessService.findViewEditableByUserOrThrow({
          viewId: input.id,
          workspaceId,
          userWorkspaceId,
          operation: 'update',
        })
      : undefined;

    const {
      existingViewId,
      objectMetadataId,
      mainGroupByFieldMetadataId,
      kanbanAggregateOperationFieldMetadataId,
      calendarFieldMetadataId,
      calendarEndFieldMetadataId,
    } =
      await this.viewToolIdentifierService.resolveUpsertCompleteViewIdentifiersOrThrow(
        { input, existingView, workspaceId },
      );

    const fields = isDefined(input.fields)
      ? await Promise.all(
          input.fields.map(async (field) => ({
            fieldMetadataId:
              await this.viewToolIdentifierService.getFieldMetadataIdOrThrow({
                workspaceId,
                objectMetadataId,
                reference: field,
              }),
            isVisible: field.isVisible,
            size: field.size,
          })),
        )
      : undefined;

    const filters = isDefined(input.filters)
      ? await Promise.all(
          input.filters.map(async (filter) => ({
            fieldMetadataId:
              await this.viewToolIdentifierService.getFieldMetadataIdOrThrow({
                workspaceId,
                objectMetadataId,
                reference: filter,
              }),
            operand: filter.operand,
            value: filter.value,
            subFieldName: filter.subFieldName,
          })),
        )
      : undefined;

    const sorts = isDefined(input.sorts)
      ? await Promise.all(
          input.sorts.map(async (sort) => ({
            fieldMetadataId:
              await this.viewToolIdentifierService.getFieldMetadataIdOrThrow({
                workspaceId,
                objectMetadataId,
                reference: sort,
              }),
            direction: sort.direction,
          })),
        )
      : undefined;

    const view = await this.completeViewUpsertService.upsertCompleteView({
      workspaceId,
      userWorkspaceId,
      existingViewId,
      objectMetadataId,
      name: input.name,
      icon: input.icon,
      type: input.type,
      visibility: input.visibility,
      mainGroupByFieldMetadataId,
      kanbanAggregateOperation: input.kanbanAggregateOperation,
      kanbanAggregateOperationFieldMetadataId,
      calendarLayout: input.calendarLayout,
      calendarFieldMetadataId,
      calendarEndFieldMetadataId,
      fields,
      filters,
      sorts,
    });

    return {
      success: true,
      message: `View "${view.name}" saved`,
      result: {
        id: view.id,
        name: view.name,
        objectMetadataId,
        type: view.type,
        icon: view.icon,
        visibility: view.visibility,
        fieldCount: view.viewFields?.length ?? 0,
        filterCount: view.viewFilters?.length ?? 0,
        sortCount: view.viewSorts?.length ?? 0,
      },
    };
  }
}
