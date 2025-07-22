// Test role IDs for integration tests
// These should match the roles created by DevSeederPermissionsService
export const TEST_ROLE_IDS = {
  // These are not hardcoded IDs since roles are created dynamically
  // This file serves as a placeholder for when we need standardized test role handling
} as const;

// Helper function to get role ID by label from a roles query response
export const GET_ROLE_ID_BY_LABEL = (
  roles: Array<{ id: string; label: string }>,
  label: string,
): string => {
  const ROLE = roles.find((r) => r.label === label);

  if (!ROLE) {
    throw new Error(`Role with label "${label}" not found in test data`);
  }

  return ROLE.id;
};
