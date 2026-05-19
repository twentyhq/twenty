import { isNonEmptyString } from '@sniptt/guards';
import { Temporal } from 'temporal-polyfill';

import {
  FieldActorSource,
  FieldMetadataType,
  ViewFilterOperand as RecordFilterOperand,
  type ActorFilter,
  type AddressFilter,
  type ArrayFilter,
  type BooleanFilter,
  type CurrencyFilter,
  type DateFilter,
  type FilesFilter,
  type FloatFilter,
  type MultiSelectFilter,
  type PhonesFilter,
  type RatingFilter,
  type RawJsonFilter,
  type RecordFilterValueDependencies,
  type RecordGqlOperationFilter,
  type RelationFilter,
  type SelectFilter,
  type StringFilter,
  type TSVectorFilter,
  type UUIDFilter,
} from '@/types';

import {
  computeGqlOperationFilterForEmails,
  computeGqlOperationFilterForLinks,
  convertGreaterThanOrEqualRatingToArrayOfRatingValues,
  convertLessThanOrEqualRatingToArrayOfRatingValues,
  convertRatingToRatingValue,
  generateILikeFiltersForCompositeFields,
  getEmptyRecordGqlOperationFilter,
  isExpectedSubFieldName,
} from '@/utils/filter';

import { type DateTimeFilter } from '@/types/RecordGqlOperationFilter';
import {
  checkIfShouldComputeEmptinessFilter,
  CustomError,
  getFilterTypeFromFieldType,
  getNextPeriodStart,
  getPeriodStart,
  isDefined,
  isRecordFilterValueValid,
  resolveDateFilter,
  resolveDateTimeFilter,
  resolveRelativeDateFilterStringified,
  type RecordFilter,
} from '@/utils';
import { arrayOfStringsOrVariablesSchema } from '@/utils/filter/utils/validation-schemas/arrayOfStringsOrVariablesSchema';
import { arrayOfUuidOrVariableSchema } from '@/utils/filter/utils/validation-schemas/arrayOfUuidsOrVariablesSchema';
import { jsonRelationFilterValueSchema } from '@/utils/filter/utils/validation-schemas/jsonRelationFilterValueSchema';

type FieldShared = {
  id: string;
  name: string;
  type: FieldMetadataType;
  label: string;
};

type TurnRecordFilterIntoRecordGqlOperationFilterParams = {
  filterValueDependencies: RecordFilterValueDependencies;
  recordFilter: Omit<RecordFilter, 'id'>;
  fieldMetadataItems: FieldShared[];
};

export const turnRecordFilterIntoRecordGqlOperationFilter = ({
  recordFilter,
  fieldMetadataItems,
  filterValueDependencies,
}: TurnRecordFilterIntoRecordGqlOperationFilterParams):
  | RecordGqlOperationFilter
  | undefined => {
  const sourceFieldMetadataItem = fieldMetadataItems.find(
    (field) => field.id === recordFilter.fieldMetadataId,
  );

  if (!isDefined(sourceFieldMetadataItem)) {
    return;
  }

  if (!isRecordFilterValueValid(recordFilter)) {
    return;
  }

  if (
    sourceFieldMetadataItem.type === FieldMetadataType.RELATION &&
    isDefined(recordFilter.relationTargetFieldMetadataId)
  ) {
    const targetFieldMetadataItem = fieldMetadataItems.find(
      (field) => field.id === recordFilter.relationTargetFieldMetadataId,
    );

    if (!isDefined(targetFieldMetadataItem)) {
      return;
    }

    const innerFilter = buildDirectFieldGqlOperationFilter({
      recordFilter: {
        ...recordFilter,
        fieldMetadataId: targetFieldMetadataItem.id,
        relationTargetFieldMetadataId: null,
      },
      fieldMetadataItem: targetFieldMetadataItem,
      filterValueDependencies,
    });

    if (!isDefined(innerFilter)) {
      return;
    }

    return {
      [sourceFieldMetadataItem.name]: innerFilter,
    } as RecordGqlOperationFilter;
  }

  return buildDirectFieldGqlOperationFilter({
    recordFilter,
    fieldMetadataItem: sourceFieldMetadataItem,
    filterValueDependencies,
  });
};

type BuildDirectFieldGqlOperationFilterParams = {
  filterValueDependencies: RecordFilterValueDependencies;
  recordFilter: Omit<RecordFilter, 'id'>;
  fieldMetadataItem: FieldShared;
};

const buildDirectFieldGqlOperationFilter = ({
  recordFilter,
  fieldMetadataItem,
  filterValueDependencies,
}: BuildDirectFieldGqlOperationFilterParams):
  | RecordGqlOperationFilter
  | undefined => {
  const shouldComputeEmptinessFilter = checkIfShouldComputeEmptinessFilter({
    recordFilterOperand: recordFilter.operand,
    correspondingFieldMetadataItem: fieldMetadataItem,
  });

  if (shouldComputeEmptinessFilter) {
    const emptinessFilter = getEmptyRecordGqlOperationFilter({
      operand: recordFilter.operand,
      correspondingField: fieldMetadataItem,
      recordFilter: recordFilter,
    });

    return emptinessFilter;
  }

  const subFieldName = recordFilter.subFieldName;

  const isSubFieldFilter = isNonEmptyString(subFieldName);

  const filterType = getFilterTypeFromFieldType(fieldMetadataItem.type);

  switch (filterType) {
    case 'TEXT':
      switch (recordFilter.operand) {
        case RecordFilterOperand.CONTAINS:
          return {
            [fieldMetadataItem.name]: {
              ilike: `%${recordFilter.value}%`,
            } as StringFilter,
          };
        case RecordFilterOperand.DOES_NOT_CONTAIN:
          return {
            not: {
              [fieldMetadataItem.name]: {
                ilike: `%${recordFilter.value}%`,
              } as StringFilter,
            },
          };
        default:
          throw new CustomError(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
            'UNKNOWN_OPERAND_FOR_FILTER',
          );
      }
    case 'TS_VECTOR':
      switch (recordFilter.operand) {
        case RecordFilterOperand.VECTOR_SEARCH:
          return {
            [fieldMetadataItem.name]: {
              search: recordFilter.value,
            } as TSVectorFilter,
          };
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    case 'RAW_JSON':
      switch (recordFilter.operand) {
        case RecordFilterOperand.CONTAINS:
          return {
            [fieldMetadataItem.name]: {
              like: `%${recordFilter.value}%`,
            } as RawJsonFilter,
          };
        case RecordFilterOperand.DOES_NOT_CONTAIN:
          return {
            not: {
              [fieldMetadataItem.name]: {
                like: `%${recordFilter.value}%`,
              } as RawJsonFilter,
            },
          };
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    case 'FILES':
      switch (recordFilter.operand) {
        case RecordFilterOperand.CONTAINS:
          return {
            [fieldMetadataItem.name]: {
              like: `%${recordFilter.value}%`,
            } as FilesFilter,
          };
        case RecordFilterOperand.DOES_NOT_CONTAIN:
          return {
            not: {
              [fieldMetadataItem.name]: {
                like: `%${recordFilter.value}%`,
              } as FilesFilter,
            },
          };
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    case 'DATE': {
      const itsARelativeDateFilter =
        recordFilter.operand === RecordFilterOperand.IS_RELATIVE;

      if (itsARelativeDateFilter) {
        const relativeDateFilterValue = resolveRelativeDateFilterStringified(
          recordFilter.value,
        );

        const defaultDateRange = resolveDateFilter({
          value: 'PAST_1_DAY',
          operand: RecordFilterOperand.IS_RELATIVE,
        });

        if (!defaultDateRange) {
          throw new Error('Failed to resolve default date range');
        }

        const start =
          relativeDateFilterValue?.start?.toString() ?? defaultDateRange.start;

        const end =
          relativeDateFilterValue?.end?.toString() ?? defaultDateRange.end;

        return {
          and: [
            {
              [fieldMetadataItem.name]: {
                gte: start,
              } as DateFilter,
            },
            {
              [fieldMetadataItem.name]: {
                lt: end,
              } as DateFilter,
            },
          ],
        };
      }

      const operandIsTakingNowAsReference =
        recordFilter.operand === RecordFilterOperand.IS_TODAY ||
        recordFilter.operand === RecordFilterOperand.IS_IN_PAST ||
        recordFilter.operand === RecordFilterOperand.IS_IN_FUTURE;

      if (operandIsTakingNowAsReference) {
        const nowAsPlainDate = Temporal.Now.plainDateISO(
          filterValueDependencies.timeZone,
        ).toString();

        switch (recordFilter.operand) {
          case RecordFilterOperand.IS_IN_PAST:
            return {
              [fieldMetadataItem.name]: {
                lt: nowAsPlainDate,
              } as DateFilter,
            };
          case RecordFilterOperand.IS_IN_FUTURE:
            return {
              [fieldMetadataItem.name]: {
                gte: nowAsPlainDate,
              } as DateFilter,
            };
          case RecordFilterOperand.IS_TODAY: {
            return {
              [fieldMetadataItem.name]: {
                eq: nowAsPlainDate,
              } as DateFilter,
            };
          }
        }
      } else {
        const plainDateFilter = recordFilter.value;

        switch (recordFilter.operand) {
          case RecordFilterOperand.IS_AFTER: {
            return {
              [fieldMetadataItem.name]: {
                gte: plainDateFilter,
              } as DateFilter,
            };
          }
          case RecordFilterOperand.IS_BEFORE: {
            return {
              [fieldMetadataItem.name]: {
                lt: plainDateFilter,
              } as DateFilter,
            };
          }

          case RecordFilterOperand.IS: {
            return {
              [fieldMetadataItem.name]: {
                eq: plainDateFilter,
              } as DateFilter,
            };
          }
        }
      }

      throw new Error(
        `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
      );
    }
    case 'DATE_TIME': {
      const itsARelativeDateTimeFilter =
        recordFilter.operand === RecordFilterOperand.IS_RELATIVE;

      if (itsARelativeDateTimeFilter) {
        const resolvedFilterValue = resolveDateTimeFilter(recordFilter);

        const parsedRelativeDateFilterValue =
          isDefined(resolvedFilterValue) &&
          typeof resolvedFilterValue === 'object'
            ? resolvedFilterValue
            : null;

        if (!isDefined(parsedRelativeDateFilterValue)) {
          throw new Error(
            `Cannot parse relative date filter : "${recordFilter.value}"`,
          );
        }

        const defaultDateRange = resolveDateTimeFilter({
          value: `PAST_1_DAY;;${filterValueDependencies.timeZone}`,
          operand: RecordFilterOperand.IS_RELATIVE,
        });

        if (
          !isDefined(defaultDateRange?.start) ||
          !isDefined(defaultDateRange?.end)
        ) {
          throw new Error('Failed to resolve default date range');
        }

        const start =
          parsedRelativeDateFilterValue?.start ?? defaultDateRange.start;

        const end = parsedRelativeDateFilterValue?.end ?? defaultDateRange.end;

        return {
          and: [
            {
              [fieldMetadataItem.name]: {
                gte: start.toInstant().toString(),
              } as DateTimeFilter,
            },
            {
              [fieldMetadataItem.name]: {
                lt: end.toInstant().toString(),
              } as DateTimeFilter,
            },
          ],
        };
      }

      const operandIsTakingNowAsReference =
        recordFilter.operand === RecordFilterOperand.IS_TODAY ||
        recordFilter.operand === RecordFilterOperand.IS_IN_PAST ||
        recordFilter.operand === RecordFilterOperand.IS_IN_FUTURE;

      if (operandIsTakingNowAsReference) {
        const now = Temporal.Now.zonedDateTimeISO(
          filterValueDependencies.timeZone,
        );

        switch (recordFilter.operand) {
          case RecordFilterOperand.IS_IN_PAST:
            return {
              [fieldMetadataItem.name]: {
                lt: now.toInstant().round('minute').toString(),
              } as DateTimeFilter,
            };
          case RecordFilterOperand.IS_IN_FUTURE:
            return {
              [fieldMetadataItem.name]: {
                gt: now.toInstant().round('minute').toString(),
              } as DateTimeFilter,
            };
          case RecordFilterOperand.IS_TODAY: {
            return {
              and: [
                {
                  [fieldMetadataItem.name]: {
                    gte: getPeriodStart(now, 'DAY').toInstant().toString(),
                  } as DateTimeFilter,
                },
                {
                  [fieldMetadataItem.name]: {
                    lt: getNextPeriodStart(now, 'DAY').toInstant().toString(),
                  } as DateTimeFilter,
                },
              ],
            };
          }
        }
      } else {
        if (!isNonEmptyString(recordFilter.value)) {
          throw new Error(`Date filter is empty`);
        }

        if (recordFilter.operand === RecordFilterOperand.IS) {
          const timeZone = filterValueDependencies.timeZone ?? 'UTC';

          let parsedPlainDate = null;

          try {
            parsedPlainDate = recordFilter.value.includes('T')
              ? Temporal.Instant.from(recordFilter.value)
                  .toZonedDateTimeISO(timeZone)
                  .toPlainDate()
              : Temporal.PlainDate.from(recordFilter.value);
          } catch {
            throw new Error(
              `Cannot parse "${recordFilter.value}" for ${filterType} filter`,
            );
          }

          const zonedDateTime = parsedPlainDate.toZonedDateTime(timeZone);
          const start = zonedDateTime.toInstant();
          const end = zonedDateTime.add({ days: 1 }).toInstant();

          return {
            and: [
              {
                [fieldMetadataItem.name]: {
                  gte: start.toString(),
                } as DateTimeFilter,
              },
              {
                [fieldMetadataItem.name]: {
                  lt: end.toString(),
                } as DateTimeFilter,
              },
            ],
          };
        }

        const resolvedDateTime = Temporal.Instant.from(recordFilter.value);

        switch (recordFilter.operand) {
          case RecordFilterOperand.IS_AFTER: {
            return {
              [fieldMetadataItem.name]: {
                gte: resolvedDateTime.toString(),
              } as DateTimeFilter,
            };
          }
          case RecordFilterOperand.IS_BEFORE: {
            return {
              [fieldMetadataItem.name]: {
                lt: resolvedDateTime.toString(),
              } as DateTimeFilter,
            };
          }
        }
      }

      throw new Error(
        `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
      );
    }
    case 'RATING':
      switch (recordFilter.operand) {
        case RecordFilterOperand.IS:
          return {
            [fieldMetadataItem.name]: {
              eq: convertRatingToRatingValue(parseFloat(recordFilter.value)),
            } as RatingFilter,
          };
        case RecordFilterOperand.GREATER_THAN_OR_EQUAL:
          return {
            [fieldMetadataItem.name]: {
              in: convertGreaterThanOrEqualRatingToArrayOfRatingValues(
                parseFloat(recordFilter.value),
              ),
            } as RatingFilter,
          };
        case RecordFilterOperand.LESS_THAN_OR_EQUAL:
          return {
            [fieldMetadataItem.name]: {
              in: convertLessThanOrEqualRatingToArrayOfRatingValues(
                parseFloat(recordFilter.value),
              ),
            } as RatingFilter,
          };
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    case 'NUMBER':
      switch (recordFilter.operand) {
        case RecordFilterOperand.GREATER_THAN_OR_EQUAL:
          return {
            [fieldMetadataItem.name]: {
              gte: parseFloat(recordFilter.value),
            } as FloatFilter,
          };
        case RecordFilterOperand.LESS_THAN_OR_EQUAL:
          return {
            [fieldMetadataItem.name]: {
              lte: parseFloat(recordFilter.value),
            } as FloatFilter,
          };
        case RecordFilterOperand.IS:
          return {
            [fieldMetadataItem.name]: {
              eq: parseFloat(recordFilter.value),
            } as FloatFilter,
          };
        case RecordFilterOperand.IS_NOT:
          return {
            not: {
              [fieldMetadataItem.name]: {
                eq: parseFloat(recordFilter.value),
              } as FloatFilter,
            },
          };
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    case 'RELATION': {
      const { isCurrentWorkspaceMemberSelected, selectedRecordIds } =
        jsonRelationFilterValueSchema
          .catch({
            isCurrentWorkspaceMemberSelected: false,
            selectedRecordIds: arrayOfUuidOrVariableSchema.parse(
              recordFilter.value,
            ),
          })
          .parse(recordFilter.value);

      const recordIds = isCurrentWorkspaceMemberSelected
        ? [
            ...selectedRecordIds,
            filterValueDependencies?.currentWorkspaceMemberId,
          ]
        : selectedRecordIds;

      if (!isDefined(recordIds) || recordIds.length === 0) return;

      switch (recordFilter.operand) {
        case RecordFilterOperand.IS:
          return {
            [fieldMetadataItem.name + 'Id']: {
              in: recordIds,
            } as RelationFilter,
          };
        case RecordFilterOperand.IS_NOT: {
          if (!isDefined(recordIds) || recordIds.length === 0) return;
          return {
            or: [
              {
                not: {
                  [fieldMetadataItem.name + 'Id']: {
                    in: recordIds,
                  } as RelationFilter,
                },
              },
              {
                [fieldMetadataItem.name + 'Id']: {
                  is: 'NULL',
                } as RelationFilter,
              },
            ],
          };
        }
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    }
    case 'CURRENCY': {
      if (
        isExpectedSubFieldName(
          FieldMetadataType.CURRENCY,
          'currencyCode',
          subFieldName,
        )
      ) {
        const parsedCurrencyCodes = arrayOfStringsOrVariablesSchema.parse(
          recordFilter.value,
        );

        if (parsedCurrencyCodes.length === 0) return undefined;

        const gqlFilter: RecordGqlOperationFilter = {
          [fieldMetadataItem.name]: {
            currencyCode: { in: parsedCurrencyCodes },
          } as CurrencyFilter,
        };

        switch (recordFilter.operand) {
          case RecordFilterOperand.IS:
            return gqlFilter;
          case RecordFilterOperand.IS_NOT:
            return {
              not: gqlFilter,
            };
          default:
            throw new Error(
              `Unknown operand ${recordFilter.operand} for ${filterType} / ${subFieldName} filter`,
            );
        }
      } else if (
        isExpectedSubFieldName(
          FieldMetadataType.CURRENCY,
          'amountMicros',
          subFieldName,
        ) ||
        !isSubFieldFilter
      ) {
        switch (recordFilter.operand) {
          case RecordFilterOperand.GREATER_THAN_OR_EQUAL:
            return {
              [fieldMetadataItem.name]: {
                amountMicros: { gte: parseFloat(recordFilter.value) * 1000000 },
              } as CurrencyFilter,
            };
          case RecordFilterOperand.LESS_THAN_OR_EQUAL:
            return {
              [fieldMetadataItem.name]: {
                amountMicros: { lte: parseFloat(recordFilter.value) * 1000000 },
              } as CurrencyFilter,
            };
          case RecordFilterOperand.IS:
            return {
              [fieldMetadataItem.name]: {
                amountMicros: { eq: parseFloat(recordFilter.value) * 1000000 },
              } as CurrencyFilter,
            };
          case RecordFilterOperand.IS_NOT:
            return {
              not: {
                [fieldMetadataItem.name]: {
                  amountMicros: {
                    eq: parseFloat(recordFilter.value) * 1000000,
                  },
                } as CurrencyFilter,
              },
            };
          default:
            throw new Error(
              `Unknown operand ${recordFilter.operand} for ${filterType} / ${subFieldName}  filter`,
            );
        }
      } else {
        throw new Error(
          `Unknown subfield ${subFieldName} for ${filterType} filter`,
        );
      }
    }
    case 'LINKS': {
      return computeGqlOperationFilterForLinks({
        correspondingFieldMetadataItem: fieldMetadataItem,
        recordFilter,
        subFieldName,
      });
    }
    case 'FULL_NAME': {
      const fullNameFilters = generateILikeFiltersForCompositeFields(
        recordFilter.value,
        fieldMetadataItem.name,
        ['firstName', 'lastName'],
      );
      switch (recordFilter.operand) {
        case RecordFilterOperand.CONTAINS:
          if (!isSubFieldFilter) {
            return {
              or: fullNameFilters,
            };
          } else {
            return {
              [fieldMetadataItem.name]: {
                [subFieldName]: {
                  ilike: `%${recordFilter.value}%`,
                },
              },
            };
          }
        case RecordFilterOperand.DOES_NOT_CONTAIN:
          if (!isSubFieldFilter) {
            return {
              and: fullNameFilters.map((filter) => {
                return {
                  not: filter,
                };
              }),
            };
          } else {
            return {
              not: {
                [fieldMetadataItem.name]: {
                  [subFieldName]: {
                    ilike: `%${recordFilter.value}%`,
                  },
                },
              },
            };
          }
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    }
    case 'ADDRESS':
      switch (recordFilter.operand) {
        case RecordFilterOperand.CONTAINS:
          if (!isSubFieldFilter) {
            return {
              or: [
                {
                  [fieldMetadataItem.name]: {
                    addressStreet1: {
                      ilike: `%${recordFilter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [fieldMetadataItem.name]: {
                    addressStreet2: {
                      ilike: `%${recordFilter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [fieldMetadataItem.name]: {
                    addressCity: {
                      ilike: `%${recordFilter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [fieldMetadataItem.name]: {
                    addressState: {
                      ilike: `%${recordFilter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [fieldMetadataItem.name]: {
                    addressCountry: {
                      ilike: `%${recordFilter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [fieldMetadataItem.name]: {
                    addressPostcode: {
                      ilike: `%${recordFilter.value}%`,
                    },
                  } as AddressFilter,
                },
              ],
            };
          } else {
            if (subFieldName === 'addressCountry') {
              const parsedCountryCodes = arrayOfStringsOrVariablesSchema.parse(
                recordFilter.value,
              );

              if (parsedCountryCodes.length === 0) {
                return {};
              }

              return {
                [fieldMetadataItem.name]: {
                  [subFieldName]: {
                    in: parsedCountryCodes,
                  } as AddressFilter,
                },
              };
            }

            return {
              [fieldMetadataItem.name]: {
                [subFieldName]: {
                  ilike: `%${recordFilter.value}%`,
                } as AddressFilter,
              },
            };
          }
        case RecordFilterOperand.DOES_NOT_CONTAIN:
          if (!isSubFieldFilter) {
            return {
              and: [
                {
                  or: [
                    {
                      not: {
                        [fieldMetadataItem.name]: {
                          addressStreet1: {
                            ilike: `%${recordFilter.value}%`,
                          },
                        } as AddressFilter,
                      },
                    },
                    {
                      [fieldMetadataItem.name]: {
                        addressStreet1: {
                          is: 'NULL',
                        },
                      },
                    },
                  ],
                },
                {
                  or: [
                    {
                      not: {
                        [fieldMetadataItem.name]: {
                          addressStreet2: {
                            ilike: `%${recordFilter.value}%`,
                          },
                        } as AddressFilter,
                      },
                    },
                    {
                      [fieldMetadataItem.name]: {
                        addressStreet2: {
                          is: 'NULL',
                        },
                      },
                    },
                  ],
                },
                {
                  or: [
                    {
                      not: {
                        [fieldMetadataItem.name]: {
                          addressCity: {
                            ilike: `%${recordFilter.value}%`,
                          },
                        } as AddressFilter,
                      },
                    },
                    {
                      [fieldMetadataItem.name]: {
                        addressCity: {
                          is: 'NULL',
                        },
                      },
                    },
                  ],
                },
                {
                  or: [
                    {
                      not: {
                        [fieldMetadataItem.name]: {
                          addressState: {
                            ilike: `%${recordFilter.value}%`,
                          },
                        } as AddressFilter,
                      },
                    },
                    {
                      [fieldMetadataItem.name]: {
                        addressState: {
                          is: 'NULL',
                        },
                      },
                    },
                  ],
                },
                {
                  or: [
                    {
                      not: {
                        [fieldMetadataItem.name]: {
                          addressPostcode: {
                            ilike: `%${recordFilter.value}%`,
                          },
                        } as AddressFilter,
                      },
                    },
                    {
                      [fieldMetadataItem.name]: {
                        addressPostcode: {
                          is: 'NULL',
                        },
                      },
                    },
                  ],
                },
                {
                  or: [
                    {
                      not: {
                        [fieldMetadataItem.name]: {
                          addressCountry: {
                            ilike: `%${recordFilter.value}%`,
                          },
                        } as AddressFilter,
                      },
                    },
                    {
                      [fieldMetadataItem.name]: {
                        addressCountry: {
                          is: 'NULL',
                        },
                      },
                    },
                  ],
                },
              ],
            };
          } else {
            if (subFieldName === 'addressCountry') {
              const parsedCountryCodes = JSON.parse(
                recordFilter.value,
              ) as string[];

              if (
                recordFilter.value === '[]' ||
                parsedCountryCodes.length === 0
              ) {
                return {};
              }

              return {
                or: [
                  {
                    not: {
                      [fieldMetadataItem.name]: {
                        addressCountry: {
                          in: JSON.parse(recordFilter.value),
                        } as AddressFilter,
                      },
                    },
                  },
                  {
                    [fieldMetadataItem.name]: {
                      addressCountry: {
                        is: 'NULL',
                      } as AddressFilter,
                    },
                  },
                ],
              };
            }

            return {
              or: [
                {
                  not: {
                    [fieldMetadataItem.name]: {
                      [subFieldName]: {
                        ilike: `%${recordFilter.value}%`,
                      } as AddressFilter,
                    },
                  },
                },
                {
                  [fieldMetadataItem.name]: {
                    [subFieldName]: {
                      is: 'NULL',
                    } as AddressFilter,
                  },
                },
              ],
            };
          }
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    case 'MULTI_SELECT': {
      const options = arrayOfStringsOrVariablesSchema.parse(recordFilter.value);

      if (options.length === 0) return;

      const emptyOptions = options.filter((option: string) => option === '');
      const nonEmptyOptions = options.filter((option: string) => option !== '');

      switch (recordFilter.operand) {
        case RecordFilterOperand.CONTAINS: {
          const conditions = [];

          if (nonEmptyOptions.length > 0) {
            conditions.push({
              [fieldMetadataItem.name]: {
                containsAny: nonEmptyOptions,
              } as MultiSelectFilter,
            });
          }

          if (emptyOptions.length > 0) {
            conditions.push({
              [fieldMetadataItem.name]: {
                isEmptyArray: true,
              } as MultiSelectFilter,
            });
          }

          return conditions.length === 1 ? conditions[0] : { or: conditions };
        }
        case RecordFilterOperand.DOES_NOT_CONTAIN:
          return {
            or: [
              {
                not: {
                  [fieldMetadataItem.name]: {
                    containsAny: nonEmptyOptions,
                  } as MultiSelectFilter,
                },
              },
              {
                [fieldMetadataItem.name]: {
                  isEmptyArray: true,
                } as MultiSelectFilter,
              },
              {
                [fieldMetadataItem.name]: {
                  is: 'NULL',
                } as MultiSelectFilter,
              },
            ],
          };
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    }
    case 'SELECT': {
      const options = arrayOfStringsOrVariablesSchema.parse(recordFilter.value);

      if (options.length === 0) return;

      const emptyOptions = options.filter((option: string) => option === '');
      const nonEmptyOptions = options.filter((option: string) => option !== '');

      switch (recordFilter.operand) {
        case RecordFilterOperand.IS: {
          const conditions = [];

          if (nonEmptyOptions.length > 0) {
            conditions.push({
              [fieldMetadataItem.name]: {
                in: nonEmptyOptions,
              } as SelectFilter,
            });
          }

          if (emptyOptions.length > 0) {
            conditions.push({
              [fieldMetadataItem.name]: {
                is: 'NULL',
              } as SelectFilter,
            });
          }

          return conditions.length === 1 ? conditions[0] : { or: conditions };
        }
        case RecordFilterOperand.IS_NOT: {
          const conditions = [];

          if (nonEmptyOptions.length > 0) {
            conditions.push({
              not: {
                [fieldMetadataItem.name]: {
                  in: nonEmptyOptions,
                } as SelectFilter,
              },
            });
          }

          if (emptyOptions.length > 0) {
            conditions.push({
              not: {
                [fieldMetadataItem.name]: {
                  is: 'NULL',
                } as SelectFilter,
              },
            });
          }

          return conditions.length === 1 ? conditions[0] : { and: conditions };
        }
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    }
    case 'ARRAY': {
      switch (recordFilter.operand) {
        case RecordFilterOperand.CONTAINS:
          return {
            [fieldMetadataItem.name]: {
              containsIlike: `%${recordFilter.value}%`,
            } as ArrayFilter,
          };
        case RecordFilterOperand.DOES_NOT_CONTAIN:
          return {
            not: {
              [fieldMetadataItem.name]: {
                containsIlike: `%${recordFilter.value}%`,
              } as ArrayFilter,
            },
          };
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    }
    case 'ACTOR': {
      if (subFieldName === 'source') {
        switch (recordFilter.operand) {
          case RecordFilterOperand.IS: {
            if (recordFilter.value === '[]') {
              return;
            }

            const parsedSources = JSON.parse(recordFilter.value) as string[];

            return {
              [fieldMetadataItem.name]: {
                source: {
                  in: parsedSources,
                } satisfies RelationFilter,
              },
            };
          }
          case RecordFilterOperand.IS_NOT: {
            if (recordFilter.value === '[]') {
              return;
            }

            const parsedSources = JSON.parse(recordFilter.value) as string[];

            if (parsedSources.length === 0) return;

            return {
              not: {
                [fieldMetadataItem.name]: {
                  source: {
                    in: parsedSources,
                  } satisfies RelationFilter,
                },
              },
            };
          }
          default: {
            throw new Error(
              `Unknown operand ${recordFilter.operand} for ${fieldMetadataItem.label} filter`,
            );
          }
        }
      }

      if (subFieldName === 'workspaceMemberId') {
        const { isCurrentWorkspaceMemberSelected, selectedRecordIds } =
          jsonRelationFilterValueSchema
            .catch({
              isCurrentWorkspaceMemberSelected: false,
              selectedRecordIds: arrayOfUuidOrVariableSchema.parse(
                recordFilter.value,
              ),
            })
            .parse(recordFilter.value);

        const workspaceMemberIds = isCurrentWorkspaceMemberSelected
          ? [
              ...selectedRecordIds,
              filterValueDependencies?.currentWorkspaceMemberId,
            ].filter(isDefined)
          : selectedRecordIds;

        if (!isDefined(workspaceMemberIds) || workspaceMemberIds.length === 0) {
          return;
        }

        switch (recordFilter.operand) {
          case RecordFilterOperand.IS:
            return {
              [fieldMetadataItem.name]: {
                workspaceMemberId: {
                  in: workspaceMemberIds,
                } satisfies UUIDFilter,
              },
            };
          case RecordFilterOperand.IS_NOT: {
            return {
              or: [
                {
                  not: {
                    [fieldMetadataItem.name]: {
                      workspaceMemberId: {
                        in: workspaceMemberIds,
                      } satisfies UUIDFilter,
                    },
                  },
                },
                {
                  [fieldMetadataItem.name]: {
                    workspaceMemberId: {
                      is: 'NULL',
                    } satisfies UUIDFilter,
                  },
                },
              ],
            };
          }
          default: {
            throw new Error(
              `Unknown operand ${recordFilter.operand} for ${fieldMetadataItem.label} filter`,
            );
          }
        }
      }

      const matchingSourceValues = Object.values(FieldActorSource).filter(
        (actorSource) =>
          actorSource.toLowerCase().includes(recordFilter.value.toLowerCase()),
      );

      switch (recordFilter.operand) {
        case RecordFilterOperand.CONTAINS: {
          return {
            or: [
              {
                [fieldMetadataItem.name]: {
                  name: {
                    ilike: `%${recordFilter.value}%`,
                  },
                } satisfies ActorFilter,
              },
              ...(matchingSourceValues.length > 0
                ? [
                    {
                      [fieldMetadataItem.name]: {
                        source: {
                          in: matchingSourceValues,
                        },
                      } satisfies ActorFilter,
                    },
                  ]
                : []),
            ],
          };
        }
        case RecordFilterOperand.DOES_NOT_CONTAIN: {
          return {
            and: [
              {
                not: {
                  [fieldMetadataItem.name]: {
                    name: {
                      ilike: `%${recordFilter.value}%`,
                    },
                  } satisfies ActorFilter,
                },
              },
              ...(matchingSourceValues.length > 0
                ? [
                    {
                      not: {
                        [fieldMetadataItem.name]: {
                          source: {
                            in: matchingSourceValues,
                          },
                        } satisfies ActorFilter,
                      },
                    },
                  ]
                : []),
            ],
          };
        }
        default: {
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${fieldMetadataItem.label} filter`,
          );
        }
      }
    }
    case 'EMAILS': {
      return computeGqlOperationFilterForEmails({
        correspondingFieldMetadataItem: fieldMetadataItem,
        recordFilter,
        subFieldName,
      });
    }
    case 'PHONES': {
      if (!isSubFieldFilter) {
        const filterValue = recordFilter.value.replace(/[^0-9]/g, '');

        if (!isNonEmptyString(filterValue)) {
          return;
        }

        switch (recordFilter.operand) {
          case RecordFilterOperand.CONTAINS:
            return {
              or: [
                {
                  [fieldMetadataItem.name]: {
                    primaryPhoneNumber: {
                      ilike: `%${filterValue}%`,
                    },
                  } as PhonesFilter,
                },
                {
                  [fieldMetadataItem.name]: {
                    primaryPhoneCallingCode: {
                      ilike: `%${filterValue}%`,
                    },
                  } as PhonesFilter,
                },
                {
                  [fieldMetadataItem.name]: {
                    additionalPhones: {
                      like: `%${filterValue}%`,
                    },
                  } as PhonesFilter,
                },
              ],
            };
          case RecordFilterOperand.DOES_NOT_CONTAIN:
            return {
              and: [
                {
                  not: {
                    [fieldMetadataItem.name]: {
                      primaryPhoneNumber: {
                        ilike: `%${filterValue}%`,
                      },
                    } as PhonesFilter,
                  },
                },
                {
                  not: {
                    [fieldMetadataItem.name]: {
                      primaryPhoneCallingCode: {
                        ilike: `%${filterValue}%`,
                      },
                    } as PhonesFilter,
                  },
                },
                {
                  or: [
                    {
                      not: {
                        [fieldMetadataItem.name]: {
                          additionalPhones: {
                            like: `%${filterValue}%`,
                          },
                        } as PhonesFilter,
                      },
                    },
                    {
                      [fieldMetadataItem.name]: {
                        additionalPhones: {
                          is: 'NULL',
                        } as PhonesFilter,
                      },
                    },
                  ],
                },
              ],
            };
          default:
            throw new Error(
              `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
            );
        }
      }

      const filterValue = recordFilter.value;

      switch (subFieldName) {
        case 'additionalPhones': {
          switch (recordFilter.operand) {
            case RecordFilterOperand.CONTAINS:
              return {
                or: [
                  {
                    [fieldMetadataItem.name]: {
                      additionalPhones: {
                        like: `%${filterValue}%`,
                      },
                    } as PhonesFilter,
                  },
                ],
              };
            case RecordFilterOperand.DOES_NOT_CONTAIN:
              return {
                or: [
                  {
                    not: {
                      [fieldMetadataItem.name]: {
                        additionalPhones: {
                          like: `%${filterValue}%`,
                        },
                      } as PhonesFilter,
                    },
                  },
                  {
                    [fieldMetadataItem.name]: {
                      additionalPhones: {
                        is: 'NULL',
                      } as PhonesFilter,
                    },
                  },
                ],
              };
            default:
              throw new Error(
                `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
              );
          }
        }
        case 'primaryPhoneNumber': {
          switch (recordFilter.operand) {
            case RecordFilterOperand.CONTAINS:
              return {
                [fieldMetadataItem.name]: {
                  primaryPhoneNumber: {
                    ilike: `%${filterValue}%`,
                  },
                } as PhonesFilter,
              };
            case RecordFilterOperand.DOES_NOT_CONTAIN:
              return {
                not: {
                  [fieldMetadataItem.name]: {
                    primaryPhoneNumber: {
                      ilike: `%${filterValue}%`,
                    },
                  } as PhonesFilter,
                },
              };
            default:
              throw new Error(
                `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
              );
          }
        }
        case 'primaryPhoneCallingCode': {
          switch (recordFilter.operand) {
            case RecordFilterOperand.CONTAINS:
              return {
                [fieldMetadataItem.name]: {
                  primaryPhoneCallingCode: {
                    ilike: `%${filterValue}%`,
                  },
                } as PhonesFilter,
              };
            case RecordFilterOperand.DOES_NOT_CONTAIN:
              return {
                not: {
                  [fieldMetadataItem.name]: {
                    primaryPhoneCallingCode: {
                      ilike: `%${filterValue}%`,
                    },
                  } as PhonesFilter,
                },
              };
            default:
              throw new Error(
                `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
              );
          }
        }
        default:
          throw new Error(
            `Unknown subfield ${subFieldName} for ${filterType} filter`,
          );
      }
    }
    case 'BOOLEAN': {
      return {
        [fieldMetadataItem.name]: {
          eq: recordFilter.value === 'true',
        } as BooleanFilter,
      };
    }
    case 'UUID': {
      const recordIds = arrayOfUuidOrVariableSchema.parse(recordFilter.value);

      if (!isDefined(recordIds) || recordIds.length === 0) return;

      switch (recordFilter.operand) {
        case RecordFilterOperand.IS:
          return {
            [fieldMetadataItem.name]: {
              in: recordIds,
            } as UUIDFilter,
          };
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    }
    default:
      throw new Error('Unknown filter type');
  }
};
