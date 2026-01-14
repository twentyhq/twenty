import { isDefined } from 'twenty-shared/utils';

import { type GraphColor } from 'src/modules/dashboard/chart-data/types/graph-color.enum';
import { getSelectOptionColorForValue } from 'src/modules/dashboard/chart-data/utils/get-select-option-color.util';

type FieldMetadataOption = {
  value: string;
  color?: string;
};

type DetermineChartItemColorParams = {
  configurationColor: GraphColor | null | undefined;
  selectOptions: FieldMetadataOption[] | null | undefined;
  rawValue: string | null | undefined;
};

export const determineChartItemColor = ({
  configurationColor,
  selectOptions,
  rawValue,
}: DetermineChartItemColorParams): GraphColor | undefined => {
  if (isDefined(configurationColor)) {
    return configurationColor;
  }

  if (isDefined(selectOptions)) {
    const optionColor = getSelectOptionColorForValue({
      rawValue,
      selectOptions,
    });

    if (isDefined(optionColor)) {
      return optionColor;
    }
  }

  return undefined;
};
