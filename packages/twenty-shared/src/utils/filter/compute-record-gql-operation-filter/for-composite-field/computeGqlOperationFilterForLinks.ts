import {
  ViewFilterOperand as RecordFilterOperand,
  type CompositeFieldSubFieldName,
  type LinksFilter,
  type PartialFieldMetadataItem,
} from '@/types';
import { CustomError } from '@/utils/errors';
import { type RecordFilter } from '@/utils/filter/turnRecordFilterGroupIntoGqlOperationFilter';
import { isNonEmptyString } from '@sniptt/guards';

export const computeGqlOperationFilterForLinks = ({
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
}) => {
  const isSubFieldFilter = isNonEmptyString(subFieldName);

  if (isSubFieldFilter) {
    switch (subFieldName) {
      case 'primaryLinkLabel':
      case 'primaryLinkUrl': {
        switch (recordFilter.operand) {
          case RecordFilterOperand.CONTAINS:
            return {
              [correspondingFieldMetadataItem.name]: {
                [subFieldName]: {
                  ilike: `%${recordFilter.value}%`,
                },
              } satisfies LinksFilter,
            };
          case RecordFilterOperand.DOES_NOT_CONTAIN:
            return {
              not: {
                [correspondingFieldMetadataItem.name]: {
                  [subFieldName]: {
                    ilike: `%${recordFilter.value}%`,
                  },
                } satisfies LinksFilter,
              },
            };
          default:
            throw new CustomError(
              `Unknown operand ${recordFilter.operand} for ${correspondingFieldMetadataItem.type} filter`,
              'UNKNOWN_OPERAND_FOR_FILTER',
            );
        }
      }
      case 'secondaryLinks': {
        switch (recordFilter.operand) {
          case RecordFilterOperand.CONTAINS:
            return {
              [correspondingFieldMetadataItem.name]: {
                secondaryLinks: {
                  like: `%${recordFilter.value}%`,
                },
              } satisfies LinksFilter,
            };
          case RecordFilterOperand.DOES_NOT_CONTAIN:
            return {
              or: [
                {
                  not: {
                    [correspondingFieldMetadataItem.name]: {
                      secondaryLinks: {
                        like: `%${recordFilter.value}%`,
                      },
                    } satisfies LinksFilter,
                  },
                },
                {
                  [correspondingFieldMetadataItem.name]: {
                    secondaryLinks: {
                      is: 'NULL',
                    },
                  } satisfies LinksFilter,
                },
              ],
            };
          default:
            throw new Error(
              `Unknown operand ${recordFilter.operand} for ${correspondingFieldMetadataItem.type} filter`,
            );
        }
      }
      default: {
        throw new Error( // TODO
          `Unknown subfield name ${subFieldName}`,
          // 'UNKNOWN_SUBFIELD_NAME',
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
              primaryLinkUrl: {
                ilike: `%${recordFilter.value}%`,
              },
            } satisfies LinksFilter,
          },
          {
            [correspondingFieldMetadataItem.name]: {
              primaryLinkLabel: {
                ilike: `%${recordFilter.value}%`,
              },
            } satisfies LinksFilter,
          },
          {
            [correspondingFieldMetadataItem.name]: {
              secondaryLinks: {
                like: `%${recordFilter.value}%`,
              },
            } satisfies LinksFilter,
          },
        ],
      };
    case RecordFilterOperand.DOES_NOT_CONTAIN:
      return {
        and: [
          {
            not: {
              [correspondingFieldMetadataItem.name]: {
                primaryLinkLabel: {
                  ilike: `%${recordFilter.value}%`,
                },
              } satisfies LinksFilter,
            },
          },
          {
            not: {
              [correspondingFieldMetadataItem.name]: {
                primaryLinkUrl: {
                  ilike: `%${recordFilter.value}%`,
                },
              } satisfies LinksFilter,
            },
          },
          {
            or: [
              {
                not: {
                  [correspondingFieldMetadataItem.name]: {
                    secondaryLinks: {
                      like: `%${recordFilter.value}%`,
                    },
                  } satisfies LinksFilter,
                },
              },
              {
                [correspondingFieldMetadataItem.name]: {
                  secondaryLinks: {
                    is: 'NULL',
                  },
                } satisfies LinksFilter,
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
