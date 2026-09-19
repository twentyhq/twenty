type ParsedRecordReference = {
  objectNameSingular: string;
  recordId: string;
  displayName: string;
};

// The display name is whatever the author saw at the time and may itself hold
// colons, so it is taken as the rest of the reference rather than as one more
// colon-separated field.
const RECORD_REFERENCE_PATTERN =
  /\[\[record:([A-Za-z0-9_]+):([0-9a-fA-F-]{36}):([\s\S]*?)\]\]/g;

export const parseRecordReferences = (
  text: string,
): ParsedRecordReference[] => {
  const references: ParsedRecordReference[] = [];

  for (const match of text.matchAll(RECORD_REFERENCE_PATTERN)) {
    references.push({
      objectNameSingular: match[1],
      recordId: match[2],
      displayName: match[3],
    });
  }

  return references;
};
