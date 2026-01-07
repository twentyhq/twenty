import { isNonEmptyString } from '@sniptt/guards';

import {
  FieldMetadataType,
  ViewFilterOperand as RecordFilterOperand,
  type ActorFilter,
  type AddressFilter,
  type ArrayFilter,
  type BooleanFilter,
  type CurrencyFilter,
  type DateFilter,
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
  checkIfShouldSkipFiltering,
  CustomError,
  getFilterTypeFromFieldType,
  getNextPeriodStart,
  getPeriodStart,
  isDefined,
  resolveDateFilter,
  resolveDateTimeFilter,
  resolveRelativeDateFilterStringified,
  type RecordFilter,
} from '@/utils';
import { arrayOfStringsOrVariablesSchema } from '@/utils/filter/utils/validation-schemas/arrayOfStringsOrVariablesSchema';
import { arrayOfUuidOrVariableSchema } from '@/utils/filter/utils/validation-schemas/arrayOfUuidsOrVariablesSchema';
import { jsonRelationFilterValueSchema } from '@/utils/filter/utils/validation-schemas/jsonRelationFilterValueSchema';
import { Temporal } from 'temporal-polyfill';

type FieldShared = {
  id: string;
  name: string;
  type: FieldMetadataType;
  label: string;
};

type TurnRecordFilterIntoRecordGqlOperationFilterParams = {
  filterValueDependencies: RecordFilterValueDependencies;
  recordFilter: RecordFilter;
  fieldMetadataItems: FieldShared[];
};

export const turnRecordFilterIntoRecordGqlOperationFilter = ({
  recordFilter,
  fieldMetadataItems,
  filterValueDependencies,
}: TurnRecordFilterIntoRecordGqlOperationFilterParams):
  | RecordGqlOperationFilter
  | undefined => {
  const correspondingFieldMetadataItem = fieldMetadataItems.find(
    (field) => field.id === recordFilter.fieldMetadataId,
  );

  if (!isDefined(correspondingFieldMetadataItem)) {
    return;
  }

  const shouldSkipFiltering = checkIfShouldSkipFiltering({ recordFilter });

  if (shouldSkipFiltering) {
    return;
  }

  const shouldComputeEmptinessFilter = checkIfShouldComputeEmptinessFilter({
    recordFilterOperand: recordFilter.operand,
    correspondingFieldMetadataItem,
  });

  if (shouldComputeEmptinessFilter) {
    const emptinessFilter = getEmptyRecordGqlOperationFilter({
      operand: recordFilter.operand,
      correspondingField: correspondingFieldMetadataItem,
      recordFilter: recordFilter,
    });

    return emptinessFilter;
  }

  const subFieldName = recordFilter.subFieldName;

  const isSubFieldFilter = isNonEmptyString(subFieldName);

  const filterType = getFilterTypeFromFieldType(
    correspondingFieldMetadataItem.type,
  );

  switch (filterType) {
    case 'TEXT':
      switch (recordFilter.operand) {
        case RecordFilterOperand.CONTAINS:
          return {
            [correspondingFieldMetadataItem.name]: {
              ilike: `%${recordFilter.value}%`,
            } as StringFilter,
          };
        case RecordFilterOperand.DOES_NOT_CONTAIN:
          return {
            not: {
              [correspondingFieldMetadataItem.name]: {
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
            [correspondingFieldMetadataItem.name]: {
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
            [correspondingFieldMetadataItem.name]: {
              like: `%${recordFilter.value}%`,
            } as RawJsonFilter,
          };
        case RecordFilterOperand.DOES_NOT_CONTAIN:
          return {
            not: {
              [correspondingFieldMetadataItem.name]: {
                like: `%${recordFilter.value}%`,
              } as RawJsonFilter,
            },
          };
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    case 'DATE': {
      if (recordFilter.operand === RecordFilterOperand.IS_RELATIVE) {
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
              [correspondingFieldMetadataItem.name]: {
                gte: start,
              } as DateFilter,
            },
            {
              [correspondingFieldMetadataItem.name]: {
                lt: end,
              } as DateFilter,
            },
          ],
        };
      }

      const nowAsPlainDate = Temporal.Now.plainDateISO(
        filterValueDependencies.timeZone,
      ).toString();

      const plainDateFilter = recordFilter.value;

      switch (recordFilter.operand) {
        case RecordFilterOperand.IS_AFTER: {
          return {
            [correspondingFieldMetadataItem.name]: {
              gte: plainDateFilter,
            } as DateFilter,
          };
        }
        case RecordFilterOperand.IS_BEFORE: {
          return {
            [correspondingFieldMetadataItem.name]: {
              lt: plainDateFilter,
            } as DateFilter,
          };
        }

        case RecordFilterOperand.IS: {
          return {
            [correspondingFieldMetadataItem.name]: {
              eq: plainDateFilter,
            } as DateFilter,
          };
        }
        case RecordFilterOperand.IS_IN_PAST:
          return {
            [correspondingFieldMetadataItem.name]: {
              lt: nowAsPlainDate,
            } as DateFilter,
          };
        case RecordFilterOperand.IS_IN_FUTURE:
          return {
            [correspondingFieldMetadataItem.name]: {
              gte: nowAsPlainDate,
            } as DateFilter,
          };
        case RecordFilterOperand.IS_TODAY: {
          return {
            [correspondingFieldMetadataItem.name]: {
              eq: nowAsPlainDate,
            } as DateFilter,
          };
        }
        default:
          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${filterType} filter`,
          );
      }
    }
    case 'DATE_TIME': {
      if (recordFilter.operand === RecordFilterOperand.IS_RELATIVE) {
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
              [correspondingFieldMetadataItem.name]: {
                gte: start.toInstant().toString(),
              } as DateTimeFilter,
            },
            {
              [correspondingFieldMetadataItem.name]: {
                lt: end.toInstant().toString(),
              } as DateTimeFilter,
            },
          ],
        };
      }

      if (!isNonEmptyString(recordFilter.value)) {
        throw new Error(`Date filter is empty`);
      }

      const resolvedDateTime = Temporal.Instant.from(recordFilter.value);

      const now = Temporal.Now.zonedDateTimeISO(
        filterValueDependencies.timeZone,
      );

      switch (recordFilter.operand) {
        case RecordFilterOperand.IS_AFTER: {
          return {
            [correspondingFieldMetadataItem.name]: {
              gte: resolvedDateTime.toString(),
            } as DateTimeFilter,
          };
        }
        case RecordFilterOperand.IS_BEFORE: {
          return {
            [correspondingFieldMetadataItem.name]: {
              lt: resolvedDateTime.toString(),
            } as DateTimeFilter,
          };
        }
        case RecordFilterOperand.IS: {
          const start = resolvedDateTime
            .toZonedDateTimeISO('UTC')
            .with({ second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 })
            .toInstant();

          const end = start.add({ minutes: 1 });

          return {
            and: [
              {
                [correspondingFieldMetadataItem.name]: {
                  lt: end.toString(),
                } as DateTimeFilter,
              },
              {
                [correspondingFieldMetadataItem.name]: {
                  gte: start.toString(),
                } as DateTimeFilter,
              },
            ],
          };
        }
        case RecordFilterOperand.IS_IN_PAST:
          return {
            [correspondingFieldMetadataItem.name]: {
              lt: now.toInstant().round('minute').toString(),
            } as DateTimeFilter,
          };
        case RecordFilterOperand.IS_IN_FUTURE:
          return {
            [correspondingFieldMetadataItem.name]: {
              gt: now.toInstant().round('minute').toString(),
            } as DateTimeFilter,
          };
        case RecordFilterOperand.IS_TODAY: {
          return {
            and: [
              {
                [correspondingFieldMetadataItem.name]: {
                  gte: getPeriodStart(now, 'DAY').toInstant().toString(),
                } as DateTimeFilter,
              },
              {
                [correspondingFieldMetadataItem.name]: {
                  lt: getNextPeriodStart(now, 'DAY').toInstant().toString(),
                } as DateTimeFilter,
              },
            ],
          };
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
            [correspondingFieldMetadataItem.name]: {
              eq: convertRatingToRatingValue(parseFloat(recordFilter.value)),
            } as RatingFilter,
          };
        case RecordFilterOperand.GREATER_THAN_OR_EQUAL:
          return {
            [correspondingFieldMetadataItem.name]: {
              in: convertGreaterThanOrEqualRatingToArrayOfRatingValues(
                parseFloat(recordFilter.value),
              ),
            } as RatingFilter,
          };
        case RecordFilterOperand.LESS_THAN_OR_EQUAL:
          return {
            [correspondingFieldMetadataItem.name]: {
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
            [correspondingFieldMetadataItem.name]: {
              gte: parseFloat(recordFilter.value),
            } as FloatFilter,
          };
        case RecordFilterOperand.LESS_THAN_OR_EQUAL:
          return {
            [correspondingFieldMetadataItem.name]: {
              lte: parseFloat(recordFilter.value),
            } as FloatFilter,
          };
        case RecordFilterOperand.IS:
          return {
            [correspondingFieldMetadataItem.name]: {
              eq: parseFloat(recordFilter.value),
            } as FloatFilter,
          };
        case RecordFilterOperand.IS_NOT:
          return {
            not: {
              [correspondingFieldMetadataItem.name]: {
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
            [correspondingFieldMetadataItem.name + 'Id']: {
              in: recordIds,
            } as RelationFilter,
          };
        case RecordFilterOperand.IS_NOT: {
          if (!isDefined(recordIds) || recordIds.length === 0) return;
          return {
            or: [
              {
                not: {
                  [correspondingFieldMetadataItem.name + 'Id']: {
                    in: recordIds,
                  } as RelationFilter,
                },
              },
              {
                [correspondingFieldMetadataItem.name + 'Id']: {
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
          [correspondingFieldMetadataItem.name]: {
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
              [correspondingFieldMetadataItem.name]: {
                amountMicros: { gte: parseFloat(recordFilter.value) * 1000000 },
              } as CurrencyFilter,
            };
          case RecordFilterOperand.LESS_THAN_OR_EQUAL:
            return {
              [correspondingFieldMetadataItem.name]: {
                amountMicros: { lte: parseFloat(recordFilter.value) * 1000000 },
              } as CurrencyFilter,
            };
          case RecordFilterOperand.IS:
            return {
              [correspondingFieldMetadataItem.name]: {
                amountMicros: { eq: parseFloat(recordFilter.value) * 1000000 },
              } as CurrencyFilter,
            };
          case RecordFilterOperand.IS_NOT:
            return {
              not: {
                [correspondingFieldMetadataItem.name]: {
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
        correspondingFieldMetadataItem,
        recordFilter,
        subFieldName,
      });
    }
    case 'FULL_NAME': {
      const fullNameFilters = generateILikeFiltersForCompositeFields(
        recordFilter.value,
        correspondingFieldMetadataItem.name,
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
              [correspondingFieldMetadataItem.name]: {
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
                [correspondingFieldMetadataItem.name]: {
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
                  [correspondingFieldMetadataItem.name]: {
                    addressStreet1: {
                      ilike: `%${recordFilter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [correspondingFieldMetadataItem.name]: {
                    addressStreet2: {
                      ilike: `%${recordFilter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [correspondingFieldMetadataItem.name]: {
                    addressCity: {
                      ilike: `%${recordFilter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [correspondingFieldMetadataItem.name]: {
                    addressState: {
                      ilike: `%${recordFilter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [correspondingFieldMetadataItem.name]: {
                    addressCountry: {
                      ilike: `%${recordFilter.value}%`,
                    },
                  } as AddressFilter,
                },
                {
                  [correspondingFieldMetadataItem.name]: {
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
                [correspondingFieldMetadataItem.name]: {
                  [subFieldName]: {
                    in: parsedCountryCodes,
                  } as AddressFilter,
                },
              };
            }

            return {
              [correspondingFieldMetadataItem.name]: {
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
                        [correspondingFieldMetadataItem.name]: {
                          addressStreet1: {
                            ilike: `%${recordFilter.value}%`,
                          },
                        } as AddressFilter,
                      },
                    },
                    {
                      [correspondingFieldMetadataItem.name]: {
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
                        [correspondingFieldMetadataItem.name]: {
                          addressStreet2: {
                            ilike: `%${recordFilter.value}%`,
                          },
                        } as AddressFilter,
                      },
                    },
                    {
                      [correspondingFieldMetadataItem.name]: {
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
                        [correspondingFieldMetadataItem.name]: {
                          addressCity: {
                            ilike: `%${recordFilter.value}%`,
                          },
                        } as AddressFilter,
                      },
                    },
                    {
                      [correspondingFieldMetadataItem.name]: {
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
                        [correspondingFieldMetadataItem.name]: {
                          addressState: {
                            ilike: `%${recordFilter.value}%`,
                          },
                        } as AddressFilter,
                      },
                    },
                    {
                      [correspondingFieldMetadataItem.name]: {
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
                        [correspondingFieldMetadataItem.name]: {
                          addressPostcode: {
                            ilike: `%${recordFilter.value}%`,
                          },
                        } as AddressFilter,
                      },
                    },
                    {
                      [correspondingFieldMetadataItem.name]: {
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
                        [correspondingFieldMetadataItem.name]: {
                          addressCountry: {
                            ilike: `%${recordFilter.value}%`,
                          },
                        } as AddressFilter,
                      },
                    },
                    {
                      [correspondingFieldMetadataItem.name]: {
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
                      [correspondingFieldMetadataItem.name]: {
                        addressCountry: {
                          in: JSON.parse(recordFilter.value),
                        } as AddressFilter,
                      },
                    },
                  },
                  {
                    [correspondingFieldMetadataItem.name]: {
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
                    [correspondingFieldMetadataItem.name]: {
                      [subFieldName]: {
                        ilike: `%${recordFilter.value}%`,
                      } as AddressFilter,
                    },
                  },
                },
                {
                  [correspondingFieldMetadataItem.name]: {
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
              [correspondingFieldMetadataItem.name]: {
                containsAny: nonEmptyOptions,
              } as MultiSelectFilter,
            });
          }

          if (emptyOptions.length > 0) {
            conditions.push({
              [correspondingFieldMetadataItem.name]: {
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
                  [correspondingFieldMetadataItem.name]: {
                    containsAny: nonEmptyOptions,
                  } as MultiSelectFilter,
                },
              },
              {
                [correspondingFieldMetadataItem.name]: {
                  isEmptyArray: true,
                } as MultiSelectFilter,
              },
              {
                [correspondingFieldMetadataItem.name]: {
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
              [correspondingFieldMetadataItem.name]: {
                in: nonEmptyOptions,
              } as SelectFilter,
            });
          }

          if (emptyOptions.length > 0) {
            conditions.push({
              [correspondingFieldMetadataItem.name]: {
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
                [correspondingFieldMetadataItem.name]: {
                  in: nonEmptyOptions,
                } as SelectFilter,
              },
            });
          }

          if (emptyOptions.length > 0) {
            conditions.push({
              not: {
                [correspondingFieldMetadataItem.name]: {
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
            [correspondingFieldMetadataItem.name]: {
              containsIlike: `%${recordFilter.value}%`,
            } as ArrayFilter,
          };
        case RecordFilterOperand.DOES_NOT_CONTAIN:
          return {
            not: {
              [correspondingFieldMetadataItem.name]: {
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
              [correspondingFieldMetadataItem.name]: {
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
                [correspondingFieldMetadataItem.name]: {
                  source: {
                    in: parsedSources,
                  } satisfies RelationFilter,
                },
              },
            };
          }
          default: {
            const fieldForRecordFilter = fieldMetadataItems.find(
              (field) => field.id === recordFilter.fieldMetadataId,
            );

            throw new Error(
              `Unknown operand ${recordFilter.operand} for ${fieldForRecordFilter?.label ?? ''} filter`,
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
                  name: {
                    ilike: `%${recordFilter.value}%`,
                  },
                } satisfies ActorFilter,
              },
            ],
          };
        case RecordFilterOperand.DOES_NOT_CONTAIN:
          return {
            and: [
              {
                not: {
                  [correspondingFieldMetadataItem.name]: {
                    name: {
                      ilike: `%${recordFilter.value}%`,
                    },
                  } satisfies ActorFilter,
                },
              },
            ],
          };
        default: {
          const fieldForRecordFilter = fieldMetadataItems.find(
            (field) => field.id === recordFilter.fieldMetadataId,
          );

          throw new Error(
            `Unknown operand ${recordFilter.operand} for ${fieldForRecordFilter?.label ?? ''} filter`,
          );
        }
      }
    }
    case 'EMAILS': {
      return computeGqlOperationFilterForEmails({
        correspondingFieldMetadataItem,
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
                  [correspondingFieldMetadataItem.name]: {
                    primaryPhoneNumber: {
                      ilike: `%${filterValue}%`,
                    },
                  } as PhonesFilter,
                },
                {
                  [correspondingFieldMetadataItem.name]: {
                    primaryPhoneCallingCode: {
                      ilike: `%${filterValue}%`,
                    },
                  } as PhonesFilter,
                },
                {
                  [correspondingFieldMetadataItem.name]: {
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
                    [correspondingFieldMetadataItem.name]: {
                      primaryPhoneNumber: {
                        ilike: `%${filterValue}%`,
                      },
                    } as PhonesFilter,
                  },
                },
                {
                  not: {
                    [correspondingFieldMetadataItem.name]: {
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
                        [correspondingFieldMetadataItem.name]: {
                          additionalPhones: {
                            like: `%${filterValue}%`,
                          },
                        } as PhonesFilter,
                      },
                    },
                    {
                      [correspondingFieldMetadataItem.name]: {
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
                    [correspondingFieldMetadataItem.name]: {
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
                      [correspondingFieldMetadataItem.name]: {
                        additionalPhones: {
                          like: `%${filterValue}%`,
                        },
                      } as PhonesFilter,
                    },
                  },
                  {
                    [correspondingFieldMetadataItem.name]: {
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
                [correspondingFieldMetadataItem.name]: {
                  primaryPhoneNumber: {
                    ilike: `%${filterValue}%`,
                  },
                } as PhonesFilter,
              };
            case RecordFilterOperand.DOES_NOT_CONTAIN:
              return {
                not: {
                  [correspondingFieldMetadataItem.name]: {
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
                [correspondingFieldMetadataItem.name]: {
                  primaryPhoneCallingCode: {
                    ilike: `%${filterValue}%`,
                  },
                } as PhonesFilter,
              };
            case RecordFilterOperand.DOES_NOT_CONTAIN:
              return {
                not: {
                  [correspondingFieldMetadataItem.name]: {
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
        [correspondingFieldMetadataItem.name]: {
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
            [correspondingFieldMetadataItem.name]: {
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
