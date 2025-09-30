/*
 * _____                    _
 *|_   _|_      _____ _ __ | |_ _   _
 *  | | \ \ /\ / / _ \ '_ \| __| | | | Auto-generated file
 *  | |  \ V  V /  __/ | | | |_| |_| | Any edits to this will be overridden
 *  |_|   \_/\_/ \___|_| |_|\__|\__, |
 *                              |___/
 */

export { applyDiff } from './applyDiff';
export { filterOutByProperty } from './array/filterOutByProperty';
export { findById } from './array/findById';
export { findByProperty } from './array/findByProperty';
export { findOrThrow } from './array/findOrThrow';
export { sumByProperty } from './array/sumByProperty';
export { assertUnreachable } from './assertUnreachable';
export { computeDiffBetweenObjects } from './compute-diff-between-objects';
export { deepMerge } from './deepMerge';
export { CustomError } from './errors/CustomError';
export { extractAndSanitizeObjectStringFields } from './extractAndSanitizeObjectStringFields';
export { isFieldMetadataDateKind } from './fieldMetadata/isFieldMetadataDateKind';
export { checkIfShouldComputeEmptinessFilter } from './filter/checkIfShouldComputeEmptinessFilter';
export { checkIfShouldSkipFiltering } from './filter/checkIfShouldSkipFiltering';
export { computeGqlOperationFilterForEmails } from './filter/compute-record-gql-operation-filter/for-composite-field/computeGqlOperationFilterForEmails';
export { computeGqlOperationFilterForLinks } from './filter/compute-record-gql-operation-filter/for-composite-field/computeGqlOperationFilterForLinks';
export { computeEmptyGqlOperationFilterForEmails } from './filter/computeEmptyGqlOperationFilterForEmails';
export { computeEmptyGqlOperationFilterForLinks } from './filter/computeEmptyGqlOperationFilterForLinks';
export { computeRecordGqlOperationFilter } from './filter/computeRecordGqlOperationFilter';
export { isEmptinessOperand } from './filter/isEmptinessOperand';
export type {
  RecordFilter,
  RecordFilterGroup,
} from './filter/turnRecordFilterGroupIntoGqlOperationFilter';
export { turnRecordFilterGroupsIntoGqlOperationFilter } from './filter/turnRecordFilterGroupIntoGqlOperationFilter';
export { turnRecordFilterIntoRecordGqlOperationFilter } from './filter/turnRecordFilterIntoGqlOperationFilter';
export { combineFilters } from './filter/utils/combineFilters';
export { convertViewFilterValueToString } from './filter/utils/convertViewFilterValueToString';
export {
  convertGreaterThanOrEqualRatingToArrayOfRatingValues,
  convertLessThanOrEqualRatingToArrayOfRatingValues,
  convertRatingToRatingValue,
} from './filter/utils/fieldRatingConvertors';
export { generateILikeFiltersForCompositeFields } from './filter/utils/generateILikeFiltersForCompositeFields';
export { getEmptyRecordGqlOperationFilter } from './filter/utils/getEmptyRecordGqlOperationFilter';
export { getFilterTypeFromFieldType } from './filter/utils/getFilterTypeFromFieldType';
export { isExpectedSubFieldName } from './filter/utils/isExpectedSubFieldName';
export type {
  VariableDateViewFilterValueDirection,
  VariableDateViewFilterValueUnit,
  ResolvedDateViewFilterValue,
} from './filter/utils/resolveDateViewFilterValue';
export {
  variableDateViewFilterValueUnitSchema,
  variableDateViewFilterValuePartsSchema,
  resolveDateViewFilterValue,
} from './filter/utils/resolveDateViewFilterValue';
export { arrayOfStringsOrVariablesSchema } from './filter/utils/validation-schemas/arrayOfStringsOrVariablesSchema';
export { arrayOfUuidOrVariableSchema } from './filter/utils/validation-schemas/arrayOfUuidsOrVariablesSchema';
export {
  relationFilterValueSchemaObject,
  jsonRelationFilterValueSchema,
} from './filter/utils/validation-schemas/jsonRelationFilterValueSchema';
export { fromArrayToUniqueKeyRecord } from './from-array-to-unique-key-record.util';
export { fromArrayToValuesByKeyRecord } from './fromArrayToValuesByKeyRecord.util';
export { getURLSafely } from './getURLSafely';
export { getImageAbsoluteURI } from './image/getImageAbsoluteURI';
export {
  sanitizeURL,
  getLogoUrlFromDomainName,
} from './image/getLogoUrlFromDomainName';
export { getUniqueConstraintsFields } from './indexMetadata/getUniqueConstraintsFields';
export { getAppPath } from './navigation/getAppPath';
export { getSettingsPath } from './navigation/getSettingsPath';
export { parseJson } from './parseJson';
export { removePropertiesFromRecord } from './removePropertiesFromRecord';
export { removeUndefinedFields } from './removeUndefinedFields';
export { safeParseRelativeDateFilterValue } from './safeParseRelativeDateFilterValue';
export { getGenericOperationName } from './sentry/getGenericOperationName';
export { getHumanReadableNameFromCode } from './sentry/getHumanReadableNameFromCode';
export { capitalize } from './strings/capitalize';
export type {
  TipTapMarkType,
  TipTapNodeType,
  LinkMarkAttributes,
  TipTapMark,
} from './tiptap/tiptap-marks';
export {
  TIPTAP_MARK_TYPES,
  TIPTAP_NODE_TYPES,
  TIPTAP_MARKS_RENDER_ORDER,
} from './tiptap/tiptap-marks';
export type { StringPropertyKeys } from './trim-and-remove-duplicated-whitespaces-from-object-string-properties';
export { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from './trim-and-remove-duplicated-whitespaces-from-object-string-properties';
export { trimAndRemoveDuplicatedWhitespacesFromString } from './trim-and-remove-duplicated-whitespaces-from-string';
export { throwIfNotDefined } from './typeguard/throwIfNotDefined';
export { absoluteUrlSchema } from './url/absoluteUrlSchema';
export { buildSignedPath } from './url/buildSignedPath';
export { getAbsoluteUrl } from './url/getAbsoluteUrl';
export { getAbsoluteUrlOrThrow } from './url/getAbsoluteUrlOrThrow';
export { getUrlHostnameOrThrow } from './url/getUrlHostnameOrThrow';
export { isValidHostname } from './url/isValidHostname';
export { isValidUrl } from './url/isValidUrl';
export { lowercaseUrlOriginAndRemoveTrailingSlash } from './url/lowercaseUrlOriginAndRemoveTrailingSlash';
export { uuidToBase36 } from './uuidToBase36';
export { assertIsDefinedOrThrow } from './validation/assertIsDefinedOrThrow';
export { isDefined } from './validation/isDefined';
export { isLabelIdentifierFieldMetadataTypes } from './validation/isLabelIdentifierFieldMetadataTypes';
export { isValidLocale } from './validation/isValidLocale';
export { isValidUuid } from './validation/isValidUuid';
export { isValidVariable } from './validation/isValidVariable';
export { normalizeLocale } from './validation/normalizeLocale';
export { getCountryCodesForCallingCode } from './validation/phones-value/getCountryCodesForCallingCode';
export { isValidCountryCode } from './validation/phones-value/isValidCountryCode';
export { resolveInput } from './variable-resolver';
