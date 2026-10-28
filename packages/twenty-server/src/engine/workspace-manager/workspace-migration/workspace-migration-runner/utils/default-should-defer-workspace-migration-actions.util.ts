let defaultShouldDeferWorkspaceMigrationActions = true;

export const setDefaultShouldDeferWorkspaceMigrationActions = (
  shouldDeferActions: boolean,
): void => {
  defaultShouldDeferWorkspaceMigrationActions = shouldDeferActions;
};

export const getDefaultShouldDeferWorkspaceMigrationActions = (): boolean =>
  defaultShouldDeferWorkspaceMigrationActions;
