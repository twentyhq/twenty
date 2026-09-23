import { VIEW_GROUP_LOAD_LIMIT_OPTIONS } from '@/constants/ViewGroupLoadLimitOptions';
import { type SupportedViewGroupLoadLimit } from '@/types/SupportedViewGroupLoadLimit';

// An unsupported value would leave the view on a limit the menu cannot select
export const isSupportedViewGroupLoadLimit = (
  groupLoadLimit: number,
): groupLoadLimit is SupportedViewGroupLoadLimit => {
  return VIEW_GROUP_LOAD_LIMIT_OPTIONS.includes(
    groupLoadLimit as SupportedViewGroupLoadLimit,
  );
};
