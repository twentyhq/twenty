import {
  type CompositeFieldSubFieldName,
  type EmailsFilter,
  type PartialFieldMetadataItem,
  ViewFilterOperand as RecordFilterOperand,
  type RecordGqlOperationFilter,
} from '@/types';

import { type RecordFilterShared } from '@/utils/filter/turnRecordFilterGroupIntoGqlOperationFilter';
import { isNonEmptyString } from '@sniptt/guards';

export const computeGqlOperationFilterForEmails = ({
  recordFilter,
  correspondingFieldMetadataItem,
  subFieldName,
  throwCustomError,
}: {
  recordFilter: RecordFilterShared;
  correspondingFieldMetadataItem: Pick<PartialFieldMetadataItem, 'name' | 'type'>;
  subFieldName: CompositeFieldSubFieldName | null | undefined;
  throwCustomError: (message: string, code?: string) => never;
}): RecordGqlOperationFilter => {
  const isSubFieldFilter = isNonEmptyString(subFieldName);

  if (isSubFieldFilter) {
    switch (subFieldName) {
      case 'primaryEmail': {
        switch (recordFilter.operand) {
          case RecordFilterOperand.Contains:
            return {
              [correspondingFieldMetadataItem.name]: {
                primaryEmail: {
                  ilike: `%${recordFilter.value}%`,
                },
              } satisfies EmailsFilter,
            };
          case RecordFilterOperand.DoesNotContain:
            return {
              not: {
                [correspondingFieldMetadataItem.name]: {
                  primaryEmail: {
                    ilike: `%${recordFilter.value}%`,
                  },
                } satisfies EmailsFilter,
              },
            };
          default:
            throw new Error(
              `Unknown operand ${recordFilter.operand} for ${correspondingFieldMetadataItem.type} filter`,
            );
        }
      }
      case 'additionalEmails': {
        switch (recordFilter.operand) {
          case RecordFilterOperand.Contains:
            return {
              [correspondingFieldMetadataItem.name]: {
                additionalEmails: {
                  like: `%${recordFilter.value}%`,
                },
              } satisfies EmailsFilter,
            };
          case RecordFilterOperand.DoesNotContain:
            return {
              or: [
                {
                  not: {
                    [correspondingFieldMetadataItem.name]: {
                      additionalEmails: {
                        like: `%${recordFilter.value}%`,
                      },
                    } satisfies EmailsFilter,
                  },
                },
                {
                  [correspondingFieldMetadataItem.name]: {
                    additionalEmails: {
                      is: 'NULL',
                    },
                  } satisfies EmailsFilter,
                },
              ],
            };
          default:
            return throwCustomError(
              `Unknown operand ${recordFilter.operand} for ${correspondingFieldMetadataItem.type} filter`,
              'UNKNOWN_OPERAND_FOR_FILTER',
            );
        }
      }
      default: {
        throwCustomError(
          `Unknown subfield name ${subFieldName}`,
          'UNKNOWN_SUBFIELD_NAME',
        );
      }
    }
  }

  switch (recordFilter.operand) {
    case RecordFilterOperand.Contains:
      return {
        or: [
          {
            [correspondingFieldMetadataItem.name]: {
              primaryEmail: {
                ilike: `%${recordFilter.value}%`,
              },
            } satisfies EmailsFilter,
          },
          {
            [correspondingFieldMetadataItem.name]: {
              additionalEmails: {
                like: `%${recordFilter.value}%`,
              },
            } satisfies EmailsFilter,
          },
        ],
      };
    case RecordFilterOperand.DoesNotContain:
      return {
        and: [
          {
            not: {
              [correspondingFieldMetadataItem.name]: {
                primaryEmail: {
                  ilike: `%${recordFilter.value}%`,
                },
              } satisfies EmailsFilter,
            },
          },
          {
            or: [
              {
                not: {
                  [correspondingFieldMetadataItem.name]: {
                    additionalEmails: {
                      like: `%${recordFilter.value}%`,
                    },
                  } satisfies EmailsFilter,
                },
              },
              {
                [correspondingFieldMetadataItem.name]: {
                  additionalEmails: {
                    is: 'NULL',
                  },
                } satisfies EmailsFilter,
              },
            ],
          },
        ],
      };
    default:
      throw new Error(
        `Unknown operand ${recordFilter.operand} for ${correspondingFieldMetadataItem.type} filter`,
      );
  }
};
