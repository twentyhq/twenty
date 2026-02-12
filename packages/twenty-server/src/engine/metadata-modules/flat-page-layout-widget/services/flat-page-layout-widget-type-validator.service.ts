import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import {
  type FlatPageLayoutWidgetTypeValidatorForCreation,
  type FlatPageLayoutWidgetTypeValidatorForUpdate,
} from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-type-validator.type';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { rejectWidgetType } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/reject-widget-type.util';
import { validateFrontComponentFlatPageLayoutWidgetForCreation } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-front-component-flat-page-layout-widget-for-creation.util';
import { validateFrontComponentFlatPageLayoutWidgetForUpdate } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-front-component-flat-page-layout-widget-for-update.util';
import { validateGraphFlatPageLayoutWidgetForCreation } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-graph-flat-page-layout-widget-for-creation.util';
import { validateGraphFlatPageLayoutWidgetForUpdate } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-graph-flat-page-layout-widget-for-update.util';
import { validateIframeFlatPageLayoutWidgetForCreation } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-iframe-flat-page-layout-widget-for-creation.util';
import { validateIframeFlatPageLayoutWidgetForUpdate } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-iframe-flat-page-layout-widget-for-update.util';
import { validateStandaloneRichTextFlatPageLayoutWidgetForCreation } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-standalone-rich-text-flat-page-layout-widget-for-creation.util';
import { validateStandaloneRichTextFlatPageLayoutWidgetForUpdate } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-standalone-rich-text-flat-page-layout-widget-for-update.util';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { UniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-update.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

export type GenericValidateFlatPageLayoutWidgetTypeSpecificitiesArgs =
  UniversalFlatEntityValidationArgs<'pageLayoutWidget'> & {
    update?: UniversalFlatEntityUpdate<'pageLayoutWidget'>;
  };

export type ValidateFlatPageLayoutWidgetTypeSpecificitiesForCreationArgs =
  UniversalFlatEntityValidationArgs<'pageLayoutWidget'>;

export type ValidateFlatPageLayoutWidgetTypeSpecificitiesForUpdateArgs =
  UniversalFlatEntityValidationArgs<'pageLayoutWidget'> & {
    update: UniversalFlatEntityUpdate<'pageLayoutWidget'>;
  };

@Injectable()
export class FlatPageLayoutWidgetTypeValidatorService {
  constructor() {}

  private readonly PAGE_LAYOUT_WIDGET_TYPE_VALIDATOR_FOR_CREATION_HASHMAP: FlatPageLayoutWidgetTypeValidatorForCreation =
    {
      VIEW: rejectWidgetType(
        WidgetType.VIEW,
        'Widget type VIEW is not supported yet.',
        msg`Widget type VIEW is not supported yet.`,
      ),
      IFRAME: validateIframeFlatPageLayoutWidgetForCreation,
      FIELD: rejectWidgetType(
        WidgetType.FIELD,
        'Widget type FIELD is not supported yet.',
        msg`Widget type FIELD is not supported yet.`,
      ),
      FIELDS: rejectWidgetType(
        WidgetType.FIELDS,
        'Widget type FIELDS is not supported yet.',
        msg`Widget type FIELDS is not supported yet.`,
      ),
      GRAPH: validateGraphFlatPageLayoutWidgetForCreation,
      STANDALONE_RICH_TEXT:
        validateStandaloneRichTextFlatPageLayoutWidgetForCreation,
      FRONT_COMPONENT: validateFrontComponentFlatPageLayoutWidgetForCreation,
      TIMELINE: rejectWidgetType(
        WidgetType.TIMELINE,
        'Widget type TIMELINE is not supported yet.',
        msg`Widget type TIMELINE is not supported yet.`,
      ),
      TASKS: rejectWidgetType(
        WidgetType.TASKS,
        'Widget type TASKS is not supported yet.',
        msg`Widget type TASKS is not supported yet.`,
      ),
      NOTES: rejectWidgetType(
        WidgetType.NOTES,
        'Widget type NOTES is not supported yet.',
        msg`Widget type NOTES is not supported yet.`,
      ),
      FILES: rejectWidgetType(
        WidgetType.FILES,
        'Widget type FILES is not supported yet.',
        msg`Widget type FILES is not supported yet.`,
      ),
      EMAILS: rejectWidgetType(
        WidgetType.EMAILS,
        'Widget type EMAILS is not supported yet.',
        msg`Widget type EMAILS is not supported yet.`,
      ),
      CALENDAR: rejectWidgetType(
        WidgetType.CALENDAR,
        'Widget type CALENDAR is not supported yet.',
        msg`Widget type CALENDAR is not supported yet.`,
      ),
      FIELD_RICH_TEXT: rejectWidgetType(
        WidgetType.FIELD_RICH_TEXT,
        'Widget type FIELD_RICH_TEXT is not supported yet.',
        msg`Widget type FIELD_RICH_TEXT is not supported yet.`,
      ),
      WORKFLOW: rejectWidgetType(
        WidgetType.WORKFLOW,
        'Widget type WORKFLOW is not supported yet.',
        msg`Widget type WORKFLOW is not supported yet.`,
      ),
      WORKFLOW_VERSION: rejectWidgetType(
        WidgetType.WORKFLOW_VERSION,
        'Widget type WORKFLOW_VERSION is not supported yet.',
        msg`Widget type WORKFLOW_VERSION is not supported yet.`,
      ),
      WORKFLOW_RUN: rejectWidgetType(
        WidgetType.WORKFLOW_RUN,
        'Widget type WORKFLOW_RUN is not supported yet.',
        msg`Widget type WORKFLOW_RUN is not supported yet.`,
      ),
    };

  private readonly PAGE_LAYOUT_WIDGET_TYPE_VALIDATOR_FOR_UPDATE_HASHMAP: FlatPageLayoutWidgetTypeValidatorForUpdate =
    {
      VIEW: rejectWidgetType(
        WidgetType.VIEW,
        'Widget type VIEW is not supported yet.',
        msg`Widget type VIEW is not supported yet.`,
      ),
      IFRAME: validateIframeFlatPageLayoutWidgetForUpdate,
      FIELD: rejectWidgetType(
        WidgetType.FIELD,
        'Widget type FIELD is not supported yet.',
        msg`Widget type FIELD is not supported yet.`,
      ),
      FIELDS: rejectWidgetType(
        WidgetType.FIELDS,
        'Widget type FIELDS is not supported yet.',
        msg`Widget type FIELDS is not supported yet.`,
      ),
      GRAPH: validateGraphFlatPageLayoutWidgetForUpdate,
      STANDALONE_RICH_TEXT:
        validateStandaloneRichTextFlatPageLayoutWidgetForUpdate,
      FRONT_COMPONENT: validateFrontComponentFlatPageLayoutWidgetForUpdate,
      TIMELINE: rejectWidgetType(
        WidgetType.TIMELINE,
        'Widget type TIMELINE is not supported yet.',
        msg`Widget type TIMELINE is not supported yet.`,
      ),
      TASKS: rejectWidgetType(
        WidgetType.TASKS,
        'Widget type TASKS is not supported yet.',
        msg`Widget type TASKS is not supported yet.`,
      ),
      NOTES: rejectWidgetType(
        WidgetType.NOTES,
        'Widget type NOTES is not supported yet.',
        msg`Widget type NOTES is not supported yet.`,
      ),
      FILES: rejectWidgetType(
        WidgetType.FILES,
        'Widget type FILES is not supported yet.',
        msg`Widget type FILES is not supported yet.`,
      ),
      EMAILS: rejectWidgetType(
        WidgetType.EMAILS,
        'Widget type EMAILS is not supported yet.',
        msg`Widget type EMAILS is not supported yet.`,
      ),
      CALENDAR: rejectWidgetType(
        WidgetType.CALENDAR,
        'Widget type CALENDAR is not supported yet.',
        msg`Widget type CALENDAR is not supported yet.`,
      ),
      FIELD_RICH_TEXT: rejectWidgetType(
        WidgetType.FIELD_RICH_TEXT,
        'Widget type FIELD_RICH_TEXT is not supported yet.',
        msg`Widget type FIELD_RICH_TEXT is not supported yet.`,
      ),
      WORKFLOW: rejectWidgetType(
        WidgetType.WORKFLOW,
        'Widget type WORKFLOW is not supported yet.',
        msg`Widget type WORKFLOW is not supported yet.`,
      ),
      WORKFLOW_VERSION: rejectWidgetType(
        WidgetType.WORKFLOW_VERSION,
        'Widget type WORKFLOW_VERSION is not supported yet.',
        msg`Widget type WORKFLOW_VERSION is not supported yet.`,
      ),
      WORKFLOW_RUN: rejectWidgetType(
        WidgetType.WORKFLOW_RUN,
        'Widget type WORKFLOW_RUN is not supported yet.',
        msg`Widget type WORKFLOW_RUN is not supported yet.`,
      ),
    };

  public validateFlatPageLayoutWidgetTypeSpecificitiesForCreation(
    args: ValidateFlatPageLayoutWidgetTypeSpecificitiesForCreationArgs,
  ): FlatPageLayoutWidgetValidationError[] {
    const { flatEntityToValidate } = args;
    const widgetType = flatEntityToValidate.type;
    const pageLayoutWidgetTypeValidator =
      this.PAGE_LAYOUT_WIDGET_TYPE_VALIDATOR_FOR_CREATION_HASHMAP[widgetType];

    if (!isDefined(pageLayoutWidgetTypeValidator)) {
      return [
        {
          code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
          message: `Unsupported page layout widget type ${widgetType}`,
          value: widgetType,
          userFriendlyMessage: msg`Unsupported page layout widget type ${widgetType}`,
        },
      ];
    }

    return pageLayoutWidgetTypeValidator(args);
  }

  public validateFlatPageLayoutWidgetTypeSpecificitiesForUpdate(
    args: ValidateFlatPageLayoutWidgetTypeSpecificitiesForUpdateArgs,
  ): FlatPageLayoutWidgetValidationError[] {
    const { flatEntityToValidate } = args;
    const widgetType = flatEntityToValidate.type;
    const pageLayoutWidgetTypeValidator =
      this.PAGE_LAYOUT_WIDGET_TYPE_VALIDATOR_FOR_UPDATE_HASHMAP[widgetType];

    if (!isDefined(pageLayoutWidgetTypeValidator)) {
      return [
        {
          code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
          message: `Unsupported page layout widget type ${widgetType}`,
          value: widgetType,
          userFriendlyMessage: msg`Unsupported page layout widget type ${widgetType}`,
        },
      ];
    }

    return pageLayoutWidgetTypeValidator(args);
  }
}
