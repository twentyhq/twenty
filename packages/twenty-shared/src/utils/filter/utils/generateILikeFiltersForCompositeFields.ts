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

  const tokens = filterString.trim().split(/\s+/).filter(Boolean);

  if (tokens.length <= 1) {
    return subFields.map((subField) => {
      return {
        [baseFieldName]: {
          [subField]: {
            ilike: `%${tokens[0] ?? ''}%`,
          },
        },
      };
    });
  }

  return [
    {
      and: tokens.map((token) => {
        return {
          or: subFields.map((subField) => {
            return {
              [baseFieldName]: {
                [subField]: {
                  ilike: `%${token}%`,
                },
              },
            };
          }),
        };
      }),
    },
  ];
};
