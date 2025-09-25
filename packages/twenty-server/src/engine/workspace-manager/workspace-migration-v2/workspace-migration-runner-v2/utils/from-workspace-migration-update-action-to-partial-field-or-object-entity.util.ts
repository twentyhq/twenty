export const fromWorkspaceMigrationUpdateActionToPartialEntity = <
  T extends { updates: Array<{ property: string; to: unknown }> },
>(
  action: T,
) => {
  return action.updates.reduce((acc, { to, property }) => {
    return {
      ...acc,
      [property]: to,
    };
  }, {});
};
