import { VIEW_GROUP_LOAD_LIMIT_OPTIONS } from '@/constants/ViewGroupLoadLimitOptions';

export type SupportedViewGroupLoadLimit =
  (typeof VIEW_GROUP_LOAD_LIMIT_OPTIONS)[number];

// Grouped queries page on this value and the Group options menu can only preselect a limit it offers, so an unsupported value would leave the view on a limit no one can change from the UI
export const isSupportedViewGroupLoadLimit = (
  groupLoadLimit: number,
): groupLoadLimit is SupportedViewGroupLoadLimit => {
  return VIEW_GROUP_LOAD_LIMIT_OPTIONS.includes(
    groupLoadLimit as SupportedViewGroupLoadLimit,
  );
};
