import { type RecordGqlOperationFilter } from '@/types';

export const generateILikeFiltersForCompositeFields = (
  filterString: string,
  baseFieldName: string,
  subFields: string[],
  emptyCheck = false,
): RecordGqlOperationFilter[] => {
  if (emptyCheck) {
    return subFields.map((subField) => {
      return {
        or: [
          {
            [baseFieldName]: {
              [subField]: {
                is: 'NULL',
              },
            },
          },
          {
            [baseFieldName]: {
              [subField]: {
                ilike: '',
              },
            },
          },
        ],
      };
    });
  }

  const trimmed = filterString.trim();
  const tokens = trimmed.split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    return [];
  }

  if (tokens.length === 1) {
    return subFields.map((subField) => ({
      [baseFieldName]: {
        [subField]: {
          ilike: `%${tokens[0]}%`,
        },
      },
    }));
  }

  return [
    {
      and: tokens.map((token) => ({
        or: subFields.map((subField) => ({
          [baseFieldName]: {
            [subField]: {
              ilike: `%${token}%`,
            },
          },
        })),
      })),
    },
  ];
};
