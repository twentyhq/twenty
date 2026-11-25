import { type ViewType } from '@/types';
import { isViewCompactByDefault } from '@/utils/views/isViewCompactByDefault';

type ViewTypeValue = `${ViewType}`;

export const resolveViewIsCompactOnViewTypeChange = ({
  fromViewType,
  toViewType,
  isCompact,
}: {
  fromViewType: ViewTypeValue;
  toViewType: ViewTypeValue;
  isCompact: boolean;
}): boolean => {
  const isCompactByDefault = isViewCompactByDefault(toViewType);

  if (isViewCompactByDefault(fromViewType) === isCompactByDefault) {
    return isCompact;
  }

  return isCompactByDefault;
};
