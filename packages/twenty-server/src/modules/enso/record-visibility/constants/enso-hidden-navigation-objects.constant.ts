// Objects a scoped role keeps READ access to but should not carry in the
// sidebar. They are plumbing: audit trails, marketing bookkeeping and the
// workspace directory. A manager still meets them where they matter — on a
// record page, in a relation panel, through search — just not as a top-level
// table they are invited to browse.
//
// Kept separate from object permissions on purpose. Revoking read would also
// empty the relation panels on records the manager legitimately owns, and
// `workspaceMember` cannot be revoked at all: Twenty forces canRead=true on it
// for every role.
export const ENSO_HIDDEN_NAVIGATION_OBJECT_NAME_SINGULARS = [
  'sequenceRun',
  'dealStateHistory',
  'marketingEnrollment',
  'personProjectConsentEvent',
  'workspaceMember',
  'projectRoutingMember',
];
