import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType } from 'twenty-shared/types';

import { AI_SEARCH_ANSWER_MAX_FIELD_VALUE_CHARACTERS } from 'src/engine/metadata-modules/ai/ai-search-answer/constants/ai-search-answer-max-field-value-characters.constant';
import {
  type AiSearchAnswerEvidenceField,
  type AiSearchAnswerEvidenceRecord,
} from 'src/engine/metadata-modules/ai/ai-search-answer/types/ai-search-answer-evidence-record.type';
import { formatAiSearchAnswerFieldValue } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/format-ai-search-answer-field-value.util';
import { truncateAiSearchAnswerText } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/truncate-ai-search-answer-text.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

// Only fields that were both selected and returned by the permission-checked query reach the evidence
export const buildAiSearchAnswerEvidenceRecord = ({
  record,
  objectNameSingular,
  objectLabel,
  displayName,
  evidenceFields,
  labelIdentifierFieldMetadataId,
  getRelationDisplayName,
}: {
  record: Record<string, unknown> & { id: string };
  objectNameSingular: string;
  objectLabel: string;
  displayName: string;
  evidenceFields: FlatFieldMetadata[];
  labelIdentifierFieldMetadataId: string | null;
  getRelationDisplayName: (
    field: FlatFieldMetadata,
    value: unknown,
  ) => string | null;
}): AiSearchAnswerEvidenceRecord => {
  const fields = evidenceFields.flatMap<AiSearchAnswerEvidenceField>(
    (field) => {
      if (
        field.id === labelIdentifierFieldMetadataId ||
        !(field.name in record)
      ) {
        return [];
      }

      const rawValue = record[field.name];
      const value =
        field.type === FieldMetadataType.RELATION
          ? getRelationDisplayName(field, rawValue)
          : formatAiSearchAnswerFieldValue({ field, value: rawValue });

      if (!isNonEmptyString(value)) {
        return [];
      }

      return [
        {
          label: field.label,
          value: truncateAiSearchAnswerText(
            value,
            AI_SEARCH_ANSWER_MAX_FIELD_VALUE_CHARACTERS,
          ),
        },
      ];
    },
  );

  return {
    objectNameSingular,
    recordId: record.id,
    displayName: truncateAiSearchAnswerText(
      displayName,
      AI_SEARCH_ANSWER_MAX_FIELD_VALUE_CHARACTERS,
    ),
    objectLabel,
    fields,
  };
};
