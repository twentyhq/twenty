// Stage-2 identity resolution: when a Person gains a phone/email (a social
// name-only contact gets a number in conversation, or a new inbound arrives
// with contact details), reconcile duplicates that share that phone/email.
// Mirrors the legacy Attio "Merging Contacts" workflow (match by email or the
// last-9 phone digits; oldest record kept).

// Relations whose person foreign key must be re-pointed from a merged-away
// duplicate to the kept Person. Each reassignment is best-effort (wrapped in
// try/catch) so a unique-constraint clash on one junction never aborts the whole
// merge. (Core targets like taskTarget/noteTarget are deferred — leads rarely
// carry those before a merge.)
export const PERSON_RELATION_REASSIGNMENTS: {
  object: string;
  field: string;
}[] = [
  { object: 'opportunity', field: 'pointOfContactId' },
  { object: 'inboundActivity', field: 'personId' },
  { object: 'personProjectConsent', field: 'personId' },
  { object: 'personProjectAssignment', field: 'personId' },
  { object: 'personRelationship', field: 'personId' },
  { object: 'personRelationship', field: 'relatedPersonId' },
];

// Match phones on the last N national digits (formatting/calling-code agnostic),
// matching the legacy normalization.
export const PHONE_MATCH_DIGITS = 9;
