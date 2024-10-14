export const TEST_NAME_PREFIX = 'integration_test_record_';

export const generateRecordName = () =>
  `${TEST_NAME_PREFIX}${Math.floor(Math.random() * 1000)}`;
