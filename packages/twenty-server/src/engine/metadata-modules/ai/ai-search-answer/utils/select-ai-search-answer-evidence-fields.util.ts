import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AI_SEARCH_ANSWER_MAX_FIELDS_PER_RECORD } from 'src/engine/metadata-modules/ai/ai-search-answer/constants/ai-search-answer-max-fields-per-record.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';

const EVIDENCE_FIELD_TYPES = new Set<FieldMetadataType>([
  FieldMetadataType.TEXT,
  FieldMetadataType.NUMBER,
  FieldMetadataType.NUMERIC,
  FieldMetadataType.BOOLEAN,
  FieldMetadataType.DATE,
  FieldMetadataType.DATE_TIME,
  FieldMetadataType.SELECT,
  FieldMetadataType.MULTI_SELECT,
  FieldMetadataType.RATING,
  FieldMetadataType.CURRENCY,
  FieldMetadataType.EMAILS,
  FieldMetadataType.PHONES,
  FieldMetadataType.LINKS,
  FieldMetadataType.FULL_NAME,
  FieldMetadataType.ADDRESS,
  FieldMetadataType.ARRAY,
  FieldMetadataType.RICH_TEXT,
]);

const isEvidenceField = (field: FlatFieldMetadata): boolean => {
  if (!field.isActive || field.isSystem) {
    return false;
  }

  if (isFlatFieldMetadataOfType(field, FieldMetadataType.RELATION)) {
    return field.settings?.relationType === RelationType.MANY_TO_ONE;
  }

  return EVIDENCE_FIELD_TYPES.has(field.type);
};

export const selectAiSearchAnswerEvidenceFields = ({
  flatFields,
  labelIdentifierFieldMetadataId,
  unreadableFieldMetadataIds,
}: {
  flatFields: FlatFieldMetadata[];
  labelIdentifierFieldMetadataId: string | null;
  unreadableFieldMetadataIds: ReadonlySet<string>;
}): FlatFieldMetadata[] => {
  const readableFields = flatFields.filter(
    (field) => !unreadableFieldMetadataIds.has(field.id),
  );

  const labelIdentifierField = readableFields.find(
    (field) => field.id === labelIdentifierFieldMetadataId,
  );

  const otherFields = readableFields.filter(
    (field) =>
      field.id !== labelIdentifierFieldMetadataId && isEvidenceField(field),
  );

  return [
    ...(isDefined(labelIdentifierField) ? [labelIdentifierField] : []),
    ...otherFields,
  ].slice(0, AI_SEARCH_ANSWER_MAX_FIELDS_PER_RECORD);
};
