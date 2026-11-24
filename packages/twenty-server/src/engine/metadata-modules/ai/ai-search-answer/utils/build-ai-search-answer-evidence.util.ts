import { type ToolRecordReference } from 'twenty-shared/ai';

import { type AiSearchAnswerEvidenceRecord } from 'src/engine/metadata-modules/ai/ai-search-answer/types/ai-search-answer-evidence-record.type';

type SerializedEvidenceRecord = {
  reference: string;
  object: string;
  label: string;
  fields: Record<string, string>;
};

const fitRecordWithinBudget = (
  entry: SerializedEvidenceRecord,
  evidenceRecord: AiSearchAnswerEvidenceRecord,
  budget: number,
): string | null => {
  let serialized = JSON.stringify(entry);

  if (serialized.length > budget) {
    return null;
  }

  const usedLabels = new Set<string>();

  for (const field of evidenceRecord.fields) {
    if (usedLabels.has(field.label)) {
      continue;
    }

    const candidate = JSON.stringify({
      ...entry,
      fields: { ...entry.fields, [field.label]: field.value },
    });

    if (candidate.length > budget) {
      break;
    }

    usedLabels.add(field.label);
    entry.fields[field.label] = field.value;
    serialized = candidate;
  }

  return serialized;
};

// JSON keeps record text from breaking out of its value, and the budget bounds the prompt size
export const buildAiSearchAnswerEvidence = ({
  evidenceRecords,
  maxCharacters,
}: {
  evidenceRecords: AiSearchAnswerEvidenceRecord[];
  maxCharacters: number;
}): {
  serializedEvidence: string;
  sourcesByReference: Map<string, ToolRecordReference>;
} => {
  const serializedRecords: string[] = [];
  const sourcesByReference = new Map<string, ToolRecordReference>();
  let remainingCharacters = maxCharacters;

  evidenceRecords.forEach((evidenceRecord, index) => {
    const reference = `R${sourcesByReference.size + 1}`;
    const budget = Math.floor(
      remainingCharacters / (evidenceRecords.length - index),
    );

    const serialized = fitRecordWithinBudget(
      {
        reference,
        object: evidenceRecord.objectLabel,
        label: evidenceRecord.displayName,
        fields: {},
      },
      evidenceRecord,
      budget,
    );

    if (serialized === null) {
      return;
    }

    serializedRecords.push(serialized);
    remainingCharacters -= serialized.length;
    sourcesByReference.set(reference, {
      objectNameSingular: evidenceRecord.objectNameSingular,
      recordId: evidenceRecord.recordId,
      displayName: evidenceRecord.displayName,
    });
  });

  return {
    serializedEvidence: `[${serializedRecords.join(',')}]`,
    sourcesByReference,
  };
};
