import { cleanTestDatabase } from 'test/integration/utils/clean-test-database';

// General beforeAll for integration tests.
// Runs before each integration test file.
beforeAll(async () => {
  await cleanTestDatabase();
});
