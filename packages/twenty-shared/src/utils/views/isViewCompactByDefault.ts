import { ViewType } from '@/types';
import { getViewLayoutFromViewType } from '@/utils/views/getViewLayoutFromViewType';

export const isViewCompactByDefault = (
  viewType: Parameters<typeof getViewLayoutFromViewType>[0],
): boolean => {
  return getViewLayoutFromViewType(viewType) === ViewType.LIST;
};
