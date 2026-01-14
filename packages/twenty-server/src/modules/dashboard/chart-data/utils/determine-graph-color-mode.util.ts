import { isDefined } from 'twenty-shared/utils';

import { GraphColorMode } from 'src/modules/dashboard/chart-data/types/graph-color-mode.enum';

type FieldMetadataOption = {
  value: string;
  color?: string;
};

type DetermineGraphColorModeParams = {
  configurationColor: string | null | undefined;
  selectFieldOptions: FieldMetadataOption[] | null | undefined;
};

export const determineGraphColorMode = ({
  configurationColor,
  selectFieldOptions,
}: DetermineGraphColorModeParams): GraphColorMode => {
  const hasExplicitColor =
    isDefined(configurationColor) && configurationColor !== 'auto';
  const hasSelectFieldOptions =
    isDefined(selectFieldOptions) && selectFieldOptions.length > 0;

  return hasExplicitColor
    ? GraphColorMode.EXPLICIT_SINGLE_COLOR
    : hasSelectFieldOptions
      ? GraphColorMode.SELECT_FIELD_OPTION_COLORS
      : GraphColorMode.AUTOMATIC_PALETTE;
};
