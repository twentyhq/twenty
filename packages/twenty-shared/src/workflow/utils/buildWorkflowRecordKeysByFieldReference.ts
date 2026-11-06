import { isDefined } from '@/utils/validation/isDefined';

export type WorkflowRecordFieldReferenceSource = {
  name: string;
  manyToOneRelation?: { joinColumnName: string; morphName?: string };
};

// Names that address the same field are interchangeable in objectRecord and fieldsToUpdate
export const buildWorkflowRecordKeysByFieldReference = (
  fields: WorkflowRecordFieldReferenceSource[],
): Map<string, string[]> => {
  const recordKeysByFieldReference = new Map<string, Set<string>>();

  const addRecordKeys = ({
    references,
    recordKeys,
  }: {
    references: string[];
    recordKeys: string[];
  }) => {
    for (const reference of references) {
      const existingRecordKeys =
        recordKeysByFieldReference.get(reference) ?? new Set<string>();

      for (const recordKey of recordKeys) {
        existingRecordKeys.add(recordKey);
      }

      recordKeysByFieldReference.set(reference, existingRecordKeys);
    }
  };

  for (const { name, manyToOneRelation } of fields) {
    if (!isDefined(manyToOneRelation)) {
      addRecordKeys({ references: [name], recordKeys: [name] });
      continue;
    }

    const { joinColumnName, morphName } = manyToOneRelation;
    const fieldRecordKeys = [name, joinColumnName];

    if (!isDefined(morphName)) {
      addRecordKeys({
        references: fieldRecordKeys,
        recordKeys: fieldRecordKeys,
      });
      continue;
    }

    addRecordKeys({
      references: [...fieldRecordKeys, morphName],
      recordKeys: [morphName, ...fieldRecordKeys],
    });
  }

  return new Map(
    [...recordKeysByFieldReference].map(([reference, recordKeys]) => [
      reference,
      [...recordKeys],
    ]),
  );
};
