import {
  type GenericValidateFlatPageLayoutWidgetTypeSpecificitiesArgs,
  type ValidateFlatPageLayoutWidgetTypeSpecificitiesForCreationArgs,
  type ValidateFlatPageLayoutWidgetTypeSpecificitiesForUpdateArgs,
} from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { type WidgetType } from 'twenty-shared/types';

export type FlatPageLayoutWidgetTypeValidator = {
  [T in WidgetType]: (
    args: GenericValidateFlatPageLayoutWidgetTypeSpecificitiesArgs,
  ) => FlatPageLayoutWidgetValidationError[];
};

export type FlatPageLayoutWidgetTypeValidatorForCreation = {
  [T in WidgetType]: (
    args: ValidateFlatPageLayoutWidgetTypeSpecificitiesForCreationArgs,
  ) => FlatPageLayoutWidgetValidationError[];
};

export type FlatPageLayoutWidgetTypeValidatorForUpdate = {
  [T in WidgetType]: (
    args: ValidateFlatPageLayoutWidgetTypeSpecificitiesForUpdateArgs,
  ) => FlatPageLayoutWidgetValidationError[];
};
