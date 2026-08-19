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

  const tokens = filterString.split(' ').filter(Boolean);
  if (tokens.length <= 1) {
    return subFields.map((subField) => ({
      [baseFieldName]: {
        [subField]: {
          ilike: `%${filterString}%`,
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
