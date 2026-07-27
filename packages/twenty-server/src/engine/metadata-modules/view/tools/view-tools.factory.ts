import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import {
  AggregateOperations,
  FieldMetadataType,
  ViewCalendarLayout,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';
import { z } from 'zod';

import { formatValidationErrors } from 'src/engine/core-modules/tool-provider/utils/format-validation-errors.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';
import { type ViewFilterValue } from 'src/engine/metadata-modules/view-filter/types/view-filter-value.type';

import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { CompleteViewUpsertService } from 'src/engine/metadata-modules/view/tools/services/complete-view-upsert.service';
import { ViewQueryParamsService } from 'src/engine/metadata-modules/view/services/view-query-params.service';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import {
  isDefined,
  isFieldMetadataDateKind,
  isNonEmptyArray,
} from 'twenty-shared/utils';

const CREATABLE_VIEW_TYPES = [
  ViewType.TABLE,
  ViewType.KANBAN,
  ViewType.CALENDAR,
  ViewType.TABLE_WIDGET,
  ViewType.KANBAN_WIDGET,
  ViewType.CALENDAR_WIDGET,
] as const;

const GetViewsInputSchema = z.object({
  objectNameSingular: z
    .string()
    .optional()
    .describe(
      'Filter views by object name (e.g., "task", "person", "company"). If omitted, returns all views.',
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(50)
    .describe('Maximum views to return.'),
});

const GetViewQueryParamsInputSchema = z.object({
  viewId: z
    .string()
    .uuid()
    .describe('ID of the view to get query parameters for.'),
});

const CreateViewInputSchema = z.object({
  name: z.string().describe('View name'),
  objectNameSingular: z
    .string()
    .describe(
      'Object name this view is for (e.g., "task", "person", "company")',
    ),
  icon: z
    .string()
    .optional()
    .default('IconList')
    .describe('Icon identifier (e.g., "IconList", "IconCheckbox")'),
  type: z
    .enum(CREATABLE_VIEW_TYPES)
    .optional()
    .default(ViewType.TABLE)
    .describe(
      'View type. Use the *_WIDGET variants (TABLE_WIDGET, KANBAN_WIDGET, CALENDAR_WIDGET) for views backing a dashboard widget so they stay out of record index view pickers.',
    ),
  visibility: z
    .enum([ViewVisibility.WORKSPACE, ViewVisibility.UNLISTED])
    .optional()
    .default(ViewVisibility.WORKSPACE)
    .describe(
      'View visibility. ALWAYS prefer WORKSPACE (the default) — it is the right choice for shared views and for any view backing a dashboard widget, so the view is visible to everyone. Only use UNLISTED for a private, personal view explicitly requested by a single user, AND only when a user identity is available. An UNLISTED view created without an owner becomes invisible to everyone (e.g. its dashboard widget renders blank), so never use UNLISTED for widget-backing views.',
    ),
  mainGroupByFieldName: z
    .string()
    .optional()
    .describe(
      'Field name to group by (required for KANBAN views, must be a SELECT field, e.g., "stage", "status")',
    ),
  kanbanAggregateOperation: z
    .enum(Object.values(AggregateOperations) as [string, ...string[]])
    .optional()
    .describe(
      'Aggregate operation for kanban columns (e.g., "SUM", "AVG", "COUNT")',
    ),
  kanbanAggregateOperationFieldName: z
    .string()
    .optional()
    .describe('Field name for the kanban aggregate operation (e.g., "amount")'),
  calendarLayout: z
    .enum([
      ViewCalendarLayout.DAY,
      ViewCalendarLayout.WEEK,
      ViewCalendarLayout.MONTH,
    ])
    .optional()
    .describe(
      'Calendar layout (required for CALENDAR views, e.g., "DAY", "WEEK", "MONTH")',
    ),
  calendarFieldName: z
    .string()
    .optional()
    .describe(
      'Date field name to use for the calendar (required for CALENDAR views, must be a DATE or DATE_TIME field, e.g., "createdAt", "dueAt")',
    ),
  calendarEndFieldName: z
    .string()
    .optional()
    .describe(
      'Optional end date field name for the calendar. It must have the same DATE or DATE_TIME type as calendarFieldName.',
    ),
  fieldNames: z
    .array(z.string())
    .optional()
    .describe(
      'Field names to display in the view as columns (for TABLE) or cards (for KANBAN/CALENDAR). Fields are displayed in the order provided. Use get_field_metadata to find available field names.',
    ),
});

const UpdateViewInputSchema = z.object({
  id: z.string().uuid().describe('View ID to update'),
  name: z.string().optional().describe('New view name'),
  icon: z.string().optional().describe('New icon identifier'),
});

const DeleteViewInputSchema = z.object({
  id: z.string().uuid().describe('View ID to delete'),
});

const VIEW_FILTER_OPERAND_OPTIONS = Object.values(ViewFilterOperand);
const VIEW_SORT_DIRECTION_OPTIONS = Object.values(ViewSortDirection);

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

const UpsertCompleteViewFieldSchema = z.object({
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

const UpsertCompleteViewFilterSchema = z.object({
  ...fieldReferenceShape,
  operand: z
    .enum(VIEW_FILTER_OPERAND_OPTIONS)
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

const UpsertCompleteViewSortSchema = z.object({
  ...fieldReferenceShape,
  direction: z
    .enum(VIEW_SORT_DIRECTION_OPTIONS)
    .optional()
    .default(ViewSortDirection.ASC)
    .describe('Sort direction: ASC or DESC. Defaults to ASC.'),
});

const UpsertCompleteViewInputSchema = z.object({
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
    .enum(Object.values(AggregateOperations) as [string, ...string[]])
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
    .array(UpsertCompleteViewFieldSchema)
    .optional()
    .describe(
      'Declarative list of columns, in display order. Provided array REPLACES all existing fields; [] clears them; omit to leave untouched.',
    ),
  filters: z
    .array(UpsertCompleteViewFilterSchema)
    .optional()
    .describe(
      'Declarative list of filters. Provided array REPLACES all existing filters; [] clears them; omit to leave untouched.',
    ),
  sorts: z
    .array(UpsertCompleteViewSortSchema)
    .optional()
    .describe(
      'Declarative list of sorts. Provided array REPLACES all existing sorts; [] clears them; omit to leave untouched.',
    ),
});

type FieldReference = { fieldName?: string; fieldMetadataId?: string };

type UpsertCompleteViewIdentifiers = {
  existingViewId?: string;
  objectMetadataId: string;
  mainGroupByFieldMetadataId?: string;
  kanbanAggregateOperationFieldMetadataId?: string;
  calendarFieldMetadataId?: string;
  calendarEndFieldMetadataId?: string;
};

@Injectable()
export class ViewToolsFactory {
  constructor(
    private readonly viewService: ViewService,
    private readonly completeViewUpsertService: CompleteViewUpsertService,
    private readonly viewFieldService: ViewFieldService,
    private readonly viewQueryParamsService: ViewQueryParamsService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  private async resolveObjectMetadataId(
    workspaceId: string,
    objectNameSingular: string,
  ): Promise<string> {
    const { flatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const { idByNameSingular } = buildObjectIdByNameMaps(
      flatObjectMetadataMaps,
    );

    const objectMetadataId = idByNameSingular[objectNameSingular];

    if (!objectMetadataId) {
      throw new Error(
        `Object "${objectNameSingular}" not found. Use get_object_metadata to list available objects.`,
      );
    }

    return objectMetadataId;
  }

  private async resolveFieldMetadataId(
    workspaceId: string,
    objectMetadataId: string,
    fieldName: string,
  ): Promise<string> {
    const { flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps'],
        },
      );

    const fieldMetadata = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    ).find(
      (field) =>
        field?.name === fieldName &&
        field?.objectMetadataId === objectMetadataId,
    );

    if (!fieldMetadata) {
      throw new Error(
        `Field "${fieldName}" not found on this object. Use get_field_metadata to list available fields.`,
      );
    }

    return fieldMetadata.id;
  }

  private async resolveGroupByFieldMetadataId(
    workspaceId: string,
    objectMetadataId: string,
    fieldName: string,
  ): Promise<string> {
    const { flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps'],
        },
      );

    const fieldMetadata = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    ).find(
      (field) =>
        field?.name === fieldName &&
        field?.objectMetadataId === objectMetadataId,
    );

    if (!fieldMetadata) {
      throw new Error(
        `Field "${fieldName}" not found on this object. Use get_field_metadata to list available fields.`,
      );
    }

    if (fieldMetadata.type !== FieldMetadataType.SELECT) {
      throw new Error(
        `Field "${fieldName}" has type "${fieldMetadata.type}" and cannot be used as a group-by field. Only SELECT fields are supported for grouping (board columns and table groups).`,
      );
    }

    return fieldMetadata.id;
  }

  private async resolveCalendarFieldMetadataId(
    workspaceId: string,
    objectMetadataId: string,
    fieldName: string,
  ): Promise<string> {
    const { flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps'],
        },
      );

    const fieldMetadata = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    ).find(
      (field) =>
        field?.name === fieldName &&
        field?.objectMetadataId === objectMetadataId,
    );

    if (!fieldMetadata) {
      throw new Error(
        `Field "${fieldName}" not found on this object. Use get_field_metadata to list available fields.`,
      );
    }

    if (!isFieldMetadataDateKind(fieldMetadata.type)) {
      throw new Error(
        `Field "${fieldName}" has type "${fieldMetadata.type}" and cannot be used as a calendar field. Only DATE or DATE_TIME fields are supported.`,
      );
    }

    return fieldMetadata.id;
  }

  private async getFieldMetadataIdOrThrow(
    workspaceId: string,
    objectMetadataId: string,
    reference: FieldReference,
  ): Promise<string> {
    if (isDefined(reference.fieldMetadataId)) {
      return reference.fieldMetadataId;
    }

    if (isDefined(reference.fieldName)) {
      return this.resolveFieldMetadataId(
        workspaceId,
        objectMetadataId,
        reference.fieldName,
      );
    }

    throw new Error(
      'Each field, filter, and sort entry must provide either fieldName or fieldMetadataId.',
    );
  }

  private async resolveUpsertCompleteViewIdentifiersOrThrow({
    parameters,
    workspaceId,
    userWorkspaceId,
  }: {
    parameters: {
      id?: string;
      objectNameSingular?: string;
      type?: ViewType;
      mainGroupByFieldName?: string;
      kanbanAggregateOperationFieldName?: string;
      calendarLayout?: ViewCalendarLayout;
      calendarFieldName?: string;
      calendarEndFieldName?: string;
    };
    workspaceId: string;
    userWorkspaceId?: string;
  }): Promise<UpsertCompleteViewIdentifiers> {
    if (isDefined(parameters.id)) {
      const existingView = await this.viewService.findById(
        parameters.id,
        workspaceId,
      );

      if (!existingView) {
        throw new Error(`View with id ${parameters.id} not found`);
      }

      if (
        existingView.visibility === ViewVisibility.UNLISTED &&
        existingView.createdByUserWorkspaceId !== userWorkspaceId
      ) {
        throw new Error('You can only update your own unlisted views');
      }

      const calendarEndFieldMetadataId = isDefined(
        parameters.calendarEndFieldName,
      )
        ? await this.resolveCalendarFieldMetadataId(
            workspaceId,
            existingView.objectMetadataId,
            parameters.calendarEndFieldName,
          )
        : undefined;

      return {
        existingViewId: existingView.id,
        objectMetadataId: existingView.objectMetadataId,
        calendarEndFieldMetadataId,
      };
    }

    if (!isDefined(parameters.objectNameSingular)) {
      throw new Error(
        'objectNameSingular is required when creating a view (no id provided).',
      );
    }

    const objectMetadataId = await this.resolveObjectMetadataId(
      workspaceId,
      parameters.objectNameSingular,
    );

    if (
      parameters.type === ViewType.KANBAN &&
      !isDefined(parameters.mainGroupByFieldName)
    ) {
      throw new Error(
        'KANBAN views require mainGroupByFieldName. Provide a SELECT field name (e.g. "stage").',
      );
    }

    if (parameters.type === ViewType.CALENDAR) {
      if (!isDefined(parameters.calendarFieldName)) {
        throw new Error(
          'CALENDAR views require calendarFieldName (a DATE or DATE_TIME field name).',
        );
      }

      if (!isDefined(parameters.calendarLayout)) {
        throw new Error(
          'CALENDAR views require calendarLayout. Provide one of: "DAY", "WEEK", "MONTH".',
        );
      }
    }

    const mainGroupByFieldMetadataId = isDefined(
      parameters.mainGroupByFieldName,
    )
      ? await this.resolveGroupByFieldMetadataId(
          workspaceId,
          objectMetadataId,
          parameters.mainGroupByFieldName,
        )
      : undefined;

    const kanbanAggregateOperationFieldMetadataId = isDefined(
      parameters.kanbanAggregateOperationFieldName,
    )
      ? await this.resolveFieldMetadataId(
          workspaceId,
          objectMetadataId,
          parameters.kanbanAggregateOperationFieldName,
        )
      : undefined;

    const calendarFieldMetadataId = isDefined(parameters.calendarFieldName)
      ? await this.resolveCalendarFieldMetadataId(
          workspaceId,
          objectMetadataId,
          parameters.calendarFieldName,
        )
      : undefined;

    const calendarEndFieldMetadataId = isDefined(
      parameters.calendarEndFieldName,
    )
      ? await this.resolveCalendarFieldMetadataId(
          workspaceId,
          objectMetadataId,
          parameters.calendarEndFieldName,
        )
      : undefined;

    return {
      objectMetadataId,
      mainGroupByFieldMetadataId,
      kanbanAggregateOperationFieldMetadataId,
      calendarFieldMetadataId,
      calendarEndFieldMetadataId,
    };
  }

  generateReadTools(
    workspaceId: string,
    userWorkspaceId?: string,
    currentWorkspaceMemberId?: string,
  ): ToolSet {
    return {
      get_views: {
        description:
          'List views in the workspace. Views define how records are displayed, filtered, and sorted.',
        inputSchema: GetViewsInputSchema,
        execute: async (parameters: {
          objectNameSingular?: string;
          limit?: number;
        }) => {
          let views;

          if (parameters.objectNameSingular) {
            const objectMetadataId = await this.resolveObjectMetadataId(
              workspaceId,
              parameters.objectNameSingular,
            );

            views = await this.viewService.findByObjectMetadataId(
              workspaceId,
              objectMetadataId,
              userWorkspaceId,
            );
          } else {
            views = await this.viewService.findByWorkspaceId(
              workspaceId,
              userWorkspaceId,
            );
          }

          const limitedViews = views.slice(0, parameters.limit ?? 50);

          return limitedViews.map((view) => ({
            id: view.id,
            name: view.name,
            objectMetadataId: view.objectMetadataId,
            type: view.type,
            icon: view.icon,
            visibility: view.visibility,
            position: view.position,
          }));
        },
      },
      get_view_query_parameters: {
        description:
          'Get filter and sort parameters from a view. Use these parameters with find_* tools to query records matching the view.',
        inputSchema: GetViewQueryParamsInputSchema,
        execute: async (parameters: { viewId: string }) => {
          return this.viewQueryParamsService.resolveViewToQueryParams(
            parameters.viewId,
            workspaceId,
            currentWorkspaceMemberId,
          );
        },
      },
    };
  }

  generateWriteTools(workspaceId: string, userWorkspaceId?: string): ToolSet {
    return {
      upsert_complete_view: {
        description: `Create or update a complete view — the view plus its fields (columns), filters, and sorts — in a single call.

IDENTITY: Omit "id" to CREATE a new view (requires objectNameSingular). Provide "id" to UPDATE an existing view.

FIELD REFERENCES: In fields/filters/sorts you can reference a field by NAME (fieldName, e.g. "amount") or by UUID (fieldMetadataId). Names are resolved server-side, so you usually do NOT need get_field_metadata first. UUID wins when both are given.

DECLARATIVE CHILDREN (replace semantics): fields, filters, and sorts each describe the FULL desired set.
- A provided array REPLACES all existing entries of that kind (existing ones are deleted, the new ones created in order).
- An empty array [] CLEARS all entries of that kind.
- Omitting the key leaves existing entries untouched.
This means you never need to fetch child ids to edit a view — just pass the desired end state. For surgical single-entry edits, the granular tools (create_view_filter, update_view_sort, etc.) remain available.

VIEW TYPES: TABLE (default), KANBAN (requires mainGroupByFieldName, a SELECT field), CALENDAR (requires calendarFieldName + calendarLayout).`,
        inputSchema: UpsertCompleteViewInputSchema,
        execute: async (parameters: {
          id?: string;
          objectNameSingular?: string;
          name?: string;
          icon?: string;
          type?: ViewType;
          visibility?: ViewVisibility;
          mainGroupByFieldName?: string;
          kanbanAggregateOperation?: AggregateOperations;
          kanbanAggregateOperationFieldName?: string;
          calendarLayout?: ViewCalendarLayout;
          calendarFieldName?: string;
          calendarEndFieldName?: string;
          fields?: Array<
            FieldReference & { isVisible?: boolean; size?: number }
          >;
          filters?: Array<
            FieldReference & {
              operand: ViewFilterOperand;
              value: ViewFilterValue;
              subFieldName?: string;
            }
          >;
          sorts?: Array<FieldReference & { direction?: ViewSortDirection }>;
        }) => {
          try {
            const {
              existingViewId,
              objectMetadataId,
              mainGroupByFieldMetadataId,
              kanbanAggregateOperationFieldMetadataId,
              calendarFieldMetadataId,
              calendarEndFieldMetadataId,
            } = await this.resolveUpsertCompleteViewIdentifiersOrThrow({
              parameters,
              workspaceId,
              userWorkspaceId,
            });

            const fields = isDefined(parameters.fields)
              ? await Promise.all(
                  parameters.fields.map(async (field) => ({
                    fieldMetadataId: await this.getFieldMetadataIdOrThrow(
                      workspaceId,
                      objectMetadataId,
                      field,
                    ),
                    isVisible: field.isVisible ?? true,
                    size: field.size ?? 150,
                  })),
                )
              : undefined;

            const filters = isDefined(parameters.filters)
              ? await Promise.all(
                  parameters.filters.map(async (filter) => ({
                    fieldMetadataId: await this.getFieldMetadataIdOrThrow(
                      workspaceId,
                      objectMetadataId,
                      filter,
                    ),
                    operand: filter.operand,
                    value: filter.value,
                    subFieldName: filter.subFieldName,
                  })),
                )
              : undefined;

            const sorts = isDefined(parameters.sorts)
              ? await Promise.all(
                  parameters.sorts.map(async (sort) => ({
                    fieldMetadataId: await this.getFieldMetadataIdOrThrow(
                      workspaceId,
                      objectMetadataId,
                      sort,
                    ),
                    direction: sort.direction ?? ViewSortDirection.ASC,
                  })),
                )
              : undefined;

            const view =
              await this.completeViewUpsertService.upsertCompleteView({
                workspaceId,
                userWorkspaceId,
                existingViewId,
                objectMetadataId,
                name: parameters.name,
                icon: parameters.icon,
                type: parameters.type,
                visibility: parameters.visibility,
                mainGroupByFieldMetadataId,
                kanbanAggregateOperation: parameters.kanbanAggregateOperation,
                kanbanAggregateOperationFieldMetadataId,
                calendarLayout: parameters.calendarLayout,
                calendarFieldMetadataId,
                calendarEndFieldMetadataId,
                fields,
                filters,
                sorts,
              });

            return {
              id: view.id,
              name: view.name,
              objectMetadataId,
              type: view.type,
              icon: view.icon,
              visibility: view.visibility,
              fieldCount: view.viewFields?.length ?? 0,
              filterCount: view.viewFilters?.length ?? 0,
              sortCount: view.viewSorts?.length ?? 0,
            };
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderException) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },
      create_view: {
        description:
          'Create a new view for an object. Views define how records are displayed. For KANBAN views, mainGroupByFieldName is required and must be a SELECT field (e.g., "stage", "status"). For CALENDAR views, calendarFieldName and calendarLayout are required.',
        inputSchema: CreateViewInputSchema,
        execute: async (parameters: {
          name: string;
          objectNameSingular: string;
          icon?: string;
          type?: ViewType;
          visibility?: ViewVisibility;
          mainGroupByFieldName?: string;
          kanbanAggregateOperation?: string;
          kanbanAggregateOperationFieldName?: string;
          calendarLayout?: ViewCalendarLayout;
          calendarFieldName?: string;
          calendarEndFieldName?: string;
          fieldNames?: string[];
        }) => {
          try {
            const objectMetadataId = await this.resolveObjectMetadataId(
              workspaceId,
              parameters.objectNameSingular,
            );

            if (
              parameters.type === ViewType.KANBAN &&
              !parameters.mainGroupByFieldName
            ) {
              throw new Error(
                'KANBAN views require mainGroupByFieldName. Provide a SELECT field name (e.g., "stage", "status") to group records into columns.',
              );
            }

            if (parameters.type === ViewType.CALENDAR) {
              if (!parameters.calendarFieldName) {
                throw new Error(
                  'CALENDAR views require calendarFieldName. Provide a DATE or DATE_TIME field name (e.g., "dueAt", "createdAt").',
                );
              }

              if (!parameters.calendarLayout) {
                throw new Error(
                  'CALENDAR views require calendarLayout. Provide one of: "DAY", "WEEK", "MONTH".',
                );
              }
            }

            let mainGroupByFieldMetadataId: string | undefined;
            let kanbanAggregateOperationFieldMetadataId: string | undefined;
            let calendarFieldMetadataId: string | undefined;
            let calendarEndFieldMetadataId: string | undefined;

            if (parameters.mainGroupByFieldName) {
              mainGroupByFieldMetadataId =
                await this.resolveGroupByFieldMetadataId(
                  workspaceId,
                  objectMetadataId,
                  parameters.mainGroupByFieldName,
                );
            }

            if (parameters.kanbanAggregateOperationFieldName) {
              kanbanAggregateOperationFieldMetadataId =
                await this.resolveFieldMetadataId(
                  workspaceId,
                  objectMetadataId,
                  parameters.kanbanAggregateOperationFieldName,
                );
            }

            if (parameters.calendarFieldName) {
              calendarFieldMetadataId =
                await this.resolveCalendarFieldMetadataId(
                  workspaceId,
                  objectMetadataId,
                  parameters.calendarFieldName,
                );
            }

            if (parameters.calendarEndFieldName) {
              calendarEndFieldMetadataId =
                await this.resolveCalendarFieldMetadataId(
                  workspaceId,
                  objectMetadataId,
                  parameters.calendarEndFieldName,
                );
            }

            const view = await this.viewService.createOne({
              createViewInput: {
                name: parameters.name,
                objectMetadataId,
                icon: parameters.icon ?? 'IconList',
                type: parameters.type ?? ViewType.TABLE,
                visibility: parameters.visibility ?? ViewVisibility.WORKSPACE,
                mainGroupByFieldMetadataId,
                kanbanAggregateOperation:
                  parameters.kanbanAggregateOperation as AggregateOperations,
                kanbanAggregateOperationFieldMetadataId,
                calendarLayout: parameters.calendarLayout,
                calendarFieldMetadataId,
                calendarEndFieldMetadataId,
              },
              workspaceId,
              createdByUserWorkspaceId: userWorkspaceId,
            });

            if (isNonEmptyArray(parameters.fieldNames)) {
              const resolvedFieldMetadataIds = await Promise.all(
                parameters.fieldNames.map((fieldName) =>
                  this.resolveFieldMetadataId(
                    workspaceId,
                    objectMetadataId,
                    fieldName,
                  ),
                ),
              );

              await this.viewFieldService.createMany({
                createViewFieldInputs: resolvedFieldMetadataIds.map(
                  (fieldMetadataId, index) => ({
                    viewId: view.id,
                    fieldMetadataId,
                    isVisible: true,
                    size: 150,
                    position: index,
                  }),
                ),
                workspaceId,
              });
            }

            return {
              id: view.id,
              name: view.name,
              objectNameSingular: parameters.objectNameSingular,
              type: view.type,
              icon: view.icon,
              visibility: view.visibility,
            };
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderException) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },
      update_view: {
        description:
          'Update an existing view. You can change the name and icon.',
        inputSchema: UpdateViewInputSchema,
        execute: async (parameters: {
          id: string;
          name?: string;
          icon?: string;
        }) => {
          try {
            const existingView = await this.viewService.findById(
              parameters.id,
              workspaceId,
            );

            if (!existingView) {
              throw new Error(`View with id ${parameters.id} not found`);
            }

            if (
              existingView.visibility === ViewVisibility.UNLISTED &&
              existingView.createdByUserWorkspaceId !== userWorkspaceId
            ) {
              throw new Error('You can only update your own unlisted views');
            }

            const view = await this.viewService.updateOne({
              updateViewInput: {
                id: parameters.id,
                name: parameters.name,
                icon: parameters.icon,
              },
              workspaceId,
              userWorkspaceId,
            });

            return {
              id: view.id,
              name: view.name,
              objectMetadataId: view.objectMetadataId,
              type: view.type,
              icon: view.icon,
              visibility: view.visibility,
            };
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderException) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },
      delete_view: {
        description: 'Delete a view by its ID.',
        inputSchema: DeleteViewInputSchema,
        execute: async (parameters: { id: string }) => {
          try {
            const existingView = await this.viewService.findById(
              parameters.id,
              workspaceId,
            );

            if (!existingView) {
              throw new Error(`View with id ${parameters.id} not found`);
            }

            if (
              existingView.visibility === ViewVisibility.UNLISTED &&
              existingView.createdByUserWorkspaceId !== userWorkspaceId
            ) {
              throw new Error('You can only delete your own unlisted views');
            }

            const view = await this.viewService.deleteOne({
              deleteViewInput: { id: parameters.id },
              workspaceId,
            });

            return {
              id: view.id,
              name: view.name,
              deleted: true,
            };
          } catch (error) {
            if (error instanceof WorkspaceMigrationBuilderException) {
              throw new Error(formatValidationErrors(error));
            }
            throw error;
          }
        },
      },
    };
  }
}
