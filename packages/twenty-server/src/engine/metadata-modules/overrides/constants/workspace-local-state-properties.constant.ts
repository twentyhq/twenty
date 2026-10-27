// What a workspace may write on an overridable entity it does not own, and what an app sync keeps
export const WORKSPACE_LOCAL_STATE_PROPERTIES: ReadonlySet<string> = new Set([
  'overrides',
  'universalOverrides',
  'isActive',
]);
