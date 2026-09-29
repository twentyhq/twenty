import { type VIEW_GROUP_LOAD_LIMIT_OPTIONS } from '@/constants/ViewGroupLoadLimitOptions';

export type SupportedViewGroupLoadLimit =
  (typeof VIEW_GROUP_LOAD_LIMIT_OPTIONS)[number];
