import { isNonEmptyString } from '@sniptt/guards';
import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import {
  AggregateOperations,
  ViewCalendarLayout,
  ViewType,
  ViewVisibility,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { CREATABLE_VIEW_TYPES } from 'src/engine/metadata-modules/view/tools/constants/creatable-view-types.constant';
import { ViewToolIdentifierService } from 'src/engine/metadata-modules/view/tools/services/view-tool-identifier.service';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';

const createViewInputSchema = z.object({
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
      'View type. Use the *_WIDGET variants (TABLE_WIDGET, KANBAN_WIDGET, LIST_WIDGET, CALENDAR_WIDGET) for views backing a dashboard widget so they stay out of record index view pickers.',
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
    .enum(AggregateOperations)
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

@DefineTool({
  name: 'create_view',
  category: ToolCategory.VIEW,
  requiredPermissionFlags: [PermissionFlagType.VIEWS],
  description:
    'Create a new view for an object. Views define how records are displayed. For KANBAN views, mainGroupByFieldName is required and must be a SELECT field (e.g., "stage", "status"). For CALENDAR views, calendarFieldName and calendarLayout are required.',
})
export class CreateViewTool extends BaseTool<typeof createViewInputSchema> {
  readonly inputSchema = createViewInputSchema;

  constructor(
    private readonly viewService: ViewService,
    private readonly viewFieldService: ViewFieldService,
    private readonly viewToolIdentifierService: ViewToolIdentifierService,
  ) {
    super();
  }

  async execute({
    input,
    context: { workspaceId, userWorkspaceId },
  }: ToolExecuteArgs<typeof createViewInputSchema>): Promise<ToolOutput> {
    const objectMetadataId =
      await this.viewToolIdentifierService.resolveObjectMetadataIdOrThrow({
        workspaceId,
        objectNameSingular: input.objectNameSingular,
      });

    if (
      input.type === ViewType.KANBAN &&
      !isNonEmptyString(input.mainGroupByFieldName)
    ) {
      throw new ViewException(
        'KANBAN views require mainGroupByFieldName. Provide a SELECT field name (e.g., "stage", "status") to group records into columns.',
        ViewExceptionCode.INVALID_VIEW_DATA,
      );
    }

    if (
      input.type === ViewType.CALENDAR &&
      !isNonEmptyString(input.calendarFieldName)
    ) {
      throw new ViewException(
        'CALENDAR views require calendarFieldName. Provide a DATE or DATE_TIME field name (e.g., "dueAt", "createdAt").',
        ViewExceptionCode.INVALID_VIEW_DATA,
      );
    }

    if (input.type === ViewType.CALENDAR && !isDefined(input.calendarLayout)) {
      throw new ViewException(
        'CALENDAR views require calendarLayout. Provide one of: "DAY", "WEEK", "MONTH".',
        ViewExceptionCode.INVALID_VIEW_DATA,
      );
    }

    let mainGroupByFieldMetadataId: string | undefined;
    let kanbanAggregateOperationFieldMetadataId: string | undefined;
    let calendarFieldMetadataId: string | undefined;
    let calendarEndFieldMetadataId: string | undefined;

    if (isNonEmptyString(input.mainGroupByFieldName)) {
      mainGroupByFieldMetadataId =
        await this.viewToolIdentifierService.resolveGroupByFieldMetadataIdOrThrow(
          {
            workspaceId,
            objectMetadataId,
            fieldName: input.mainGroupByFieldName,
          },
        );
    }

    if (isNonEmptyString(input.kanbanAggregateOperationFieldName)) {
      kanbanAggregateOperationFieldMetadataId =
        await this.viewToolIdentifierService.resolveFieldMetadataIdOrThrow({
          workspaceId,
          objectMetadataId,
          fieldName: input.kanbanAggregateOperationFieldName,
        });
    }

    if (isNonEmptyString(input.calendarFieldName)) {
      calendarFieldMetadataId =
        await this.viewToolIdentifierService.resolveCalendarFieldMetadataIdOrThrow(
          {
            workspaceId,
            objectMetadataId,
            fieldName: input.calendarFieldName,
          },
        );
    }

    if (isNonEmptyString(input.calendarEndFieldName)) {
      calendarEndFieldMetadataId =
        await this.viewToolIdentifierService.resolveCalendarFieldMetadataIdOrThrow(
          {
            workspaceId,
            objectMetadataId,
            fieldName: input.calendarEndFieldName,
          },
        );
    }

    const fieldMetadataIds = isNonEmptyArray(input.fieldNames)
      ? await Promise.all(
          input.fieldNames.map((fieldName) =>
            this.viewToolIdentifierService.resolveFieldMetadataIdOrThrow({
              workspaceId,
              objectMetadataId,
              fieldName,
            }),
          ),
        )
      : [];

    const view = await this.viewService.createOne({
      createViewInput: {
        name: input.name,
        objectMetadataId,
        icon: input.icon,
        type: input.type,
        visibility: input.visibility,
        mainGroupByFieldMetadataId,
        kanbanAggregateOperation: input.kanbanAggregateOperation,
        kanbanAggregateOperationFieldMetadataId,
        calendarLayout: input.calendarLayout,
        calendarFieldMetadataId,
        calendarEndFieldMetadataId,
      },
      workspaceId,
      createdByUserWorkspaceId: userWorkspaceId,
    });

    if (isNonEmptyArray(fieldMetadataIds)) {
      await this.viewFieldService.createMany({
        createViewFieldInputs: fieldMetadataIds.map(
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
      success: true,
      message: `View "${view.name}" created`,
      result: {
        id: view.id,
        name: view.name,
        objectNameSingular: input.objectNameSingular,
        type: view.type,
        icon: view.icon,
        visibility: view.visibility,
      },
    };
  }
}
