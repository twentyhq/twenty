import { ViewFilterValue } from 'src/engine/metadata-modules/view/types/view-filter-value.type';

export const transformViewFilterWorkspaceValueToCoreValue = (
  value: string,
): ViewFilterValue => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};
