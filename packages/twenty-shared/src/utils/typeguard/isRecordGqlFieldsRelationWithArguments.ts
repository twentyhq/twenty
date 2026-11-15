import { isNonEmptyString } from '@sniptt/guards';

import { type RecordGqlFields } from '../../types/RecordGqlFields';
import { type RecordGqlFieldsRelationWithArguments } from '../../types/RecordGqlFieldsRelationWithArguments';
import { isDefined } from '../validation/isDefined';

// A nested selection can only hold `true` or objects under its keys, so a string here can only be a relation with arguments
export const isRecordGqlFieldsRelationWithArguments = (
  recordGqlFieldsValue: RecordGqlFields[string] | undefined,
): recordGqlFieldsValue is RecordGqlFieldsRelationWithArguments =>
  isDefined(recordGqlFieldsValue) &&
  recordGqlFieldsValue !== true &&
  isNonEmptyString(recordGqlFieldsValue.relationFieldName);
