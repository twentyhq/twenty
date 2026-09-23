import { VIEW_GROUP_LOAD_LIMIT_OPTIONS } from '@/constants/ViewGroupLoadLimitOptions';

export type SupportedViewGroupLoadLimit =
  (typeof VIEW_GROUP_LOAD_LIMIT_OPTIONS)[number];

// An unsupported value would leave the view on a limit the menu cannot select
export const isSupportedViewGroupLoadLimit = (
  groupLoadLimit: number,
): groupLoadLimit is SupportedViewGroupLoadLimit => {
  return VIEW_GROUP_LOAD_LIMIT_OPTIONS.includes(
    groupLoadLimit as SupportedViewGroupLoadLimit,
  );
};
