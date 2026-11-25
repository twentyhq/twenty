import { ViewType } from '@/types';
import { getViewLayoutFromViewType } from '@/utils/views/getViewLayoutFromViewType';

type ViewTypeValue = `${ViewType}`;

export const isViewCompactByDefault = (viewType: ViewTypeValue): boolean => {
  return getViewLayoutFromViewType(viewType) === ViewType.LIST;
};
