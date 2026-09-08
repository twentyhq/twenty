// Per-role default views live in core.keyValuePair, workspace-scoped
// (userId = null), one row per role holding an object → view map.
//
// keyValuePair rather than a new table on purpose: it is already the store for
// enso settings (project chat webhooks, the task-due scan cursor), so this
// needs no migration and no new entity, and a role default is exactly the kind
// of small keyed configuration it exists for.
export const ENSO_ROLE_DEFAULT_VIEWS_KEY_PREFIX = 'ENSO_ROLE_DEFAULT_VIEWS:';

export const ensoRoleDefaultViewsKey = (roleId: string): string =>
  `${ENSO_ROLE_DEFAULT_VIEWS_KEY_PREFIX}${roleId}`;
