import {
  relativeDateFilterSchema,
  type RelativeDateFilter,
} from '@/utils/filter/dates/utils/relativeDateFilterSchema';

export const safeParseRelativeDateFilterJSONStringified = (
  value: string,
): RelativeDateFilter | undefined => {
  try {
    const parsedJson = JSON.parse(value);

    const result = relativeDateFilterSchema.safeParse(parsedJson);

    if (result.success) {
      return result.data;
    }

    return undefined;
  } catch {
    return undefined;
  }
};
