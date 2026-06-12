// Allowlist of safe WHERE clause patterns for partial indexes.
// Any new pattern must be reviewed for SQL injection safety before being added.
const ALLOWED_INDEX_WHERE_CLAUSES = new Set([
  '"deletedAt" IS NULL',
  // messageSuppression: one global block (topicId NULL) and one per-topic
  // opt-out per address — split because Postgres treats NULLs as distinct.
  '"deletedAt" IS NULL AND "topicId" IS NULL',
  '"deletedAt" IS NULL AND "topicId" IS NOT NULL',
]);

export const validateAndReturnIndexWhereClause = (
  clause: string | null | undefined,
): string | undefined => {
  if (!clause) {
    return undefined;
  }

  if (ALLOWED_INDEX_WHERE_CLAUSES.has(clause)) {
    return clause;
  }

  throw new Error(
    `Unsupported index WHERE clause: "${clause}". ` +
      'Only allowlisted patterns are permitted to prevent SQL injection. ' +
      'Add the pattern to ALLOWED_INDEX_WHERE_CLAUSES after security review.',
  );
};
