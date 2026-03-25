export const TEST_NAME_PREFIX = 'test_record_';

export const generateRecordName = (uuid: string) =>
  `${TEST_NAME_PREFIX}-${uuid}`;
