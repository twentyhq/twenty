import { type RecordGqlOperationFilter } from '@/types';

export const generateILikeFiltersForCompositeFields = (
  filterString: string,
  baseFieldName: string,
  subFields: string[],
  emptyCheck = false,
) => {
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

  return filterString
    .split(' ')
    .reduce((previousValue: RecordGqlOperationFilter[], currentValue) => {
      return [
        ...previousValue,
        ...subFields.map((subField) => {
          return {
            [baseFieldName]: {
              [subField]: {
                ilike: `%${currentValue}%`,
              },
            },
          };
        }),
      ];
    }, []);
};
