import { type ViewFilterValue } from 'src/engine/metadata-modules/view/types/view-filter-value.type';

export const convertViewFilterWorkspaceValueToCoreValue = (
  value: string,
): ViewFilterValue => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};
