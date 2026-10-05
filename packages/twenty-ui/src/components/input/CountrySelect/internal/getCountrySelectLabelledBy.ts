import { isNonEmptyString } from '@sniptt/guards';

export const getCountrySelectLabelledBy = ({
  ariaLabelledBy,
  ariaLabel,
  visibleLabelId,
}: {
  ariaLabelledBy?: string;
  ariaLabel?: string;
  visibleLabelId?: string;
}) => {
  if (isNonEmptyString(ariaLabelledBy)) {
    return ariaLabelledBy;
  }

  if (isNonEmptyString(ariaLabel)) {
    return undefined;
  }

  return visibleLabelId;
};
