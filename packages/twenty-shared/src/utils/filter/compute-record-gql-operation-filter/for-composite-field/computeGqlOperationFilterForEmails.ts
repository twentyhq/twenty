import {
  type CompositeFieldSubFieldName,
  type EmailsFilter,
  type PartialFieldMetadataItem,
  ViewFilterOperand as RecordFilterOperand,
  type RecordGqlOperationFilter,
} from '@/types';
import { CustomError } from '@/utils/errors';

import { type RecordFilter } from '@/utils/filter/turnRecordFilterGroupIntoGqlOperationFilter';
import { isNonEmptyString } from '@sniptt/guards';

export const computeGqlOperationFilterForEmails = ({
  recordFilter,
  correspondingFieldMetadataItem,
  subFieldName,
}: {
  recordFilter: RecordFilter;
  correspondingFieldMetadataItem: Pick<
    PartialFieldMetadataItem,
    'name' | 'type'
  >;
  subFieldName: CompositeFieldSubFieldName | null | undefined;
}): RecordGqlOperationFilter => {
  const isSubFieldFilter = isNonEmptyString(subFieldName);

  if (isSubFieldFilter) {
    switch (subFieldName) {
      case 'primaryEmail': {
        switch (recordFilter.operand) {
          case RecordFilterOperand.CONTAINS:
            return {
              [correspondingFieldMetadataItem.name]: {
                primaryEmail: {
                  ilike: `%${recordFilter.value}%`,
                },
              } satisfies EmailsFilter,
            };
          case RecordFilterOperand.DOES_NOT_CONTAIN:
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
          case RecordFilterOperand.CONTAINS:
            return {
              [correspondingFieldMetadataItem.name]: {
                additionalEmails: {
                  like: `%${recordFilter.value}%`,
                },
              } satisfies EmailsFilter,
            };
          case RecordFilterOperand.DOES_NOT_CONTAIN:
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
            throw new CustomError(
              `Unknown operand ${recordFilter.operand} for ${correspondingFieldMetadataItem.type} filter`,
              'UNKNOWN_OPERAND_FOR_FILTER',
            );
        }
      }
      default: {
        throw new CustomError(
          `Unknown subfield name ${subFieldName}`,
          'UNKNOWN_SUBFIELD_NAME',
        );
      }
    }
  }

  switch (recordFilter.operand) {
    case RecordFilterOperand.CONTAINS:
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
    case RecordFilterOperand.DOES_NOT_CONTAIN:
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
