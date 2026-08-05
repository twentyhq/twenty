import { formatRecordReference } from '@/ai/utils/format-record-reference.util';

describe('formatRecordReference', () => {
  it('formats a record reference without altering its display name', () => {
    expect(
      formatRecordReference({
        objectNameSingular: 'company',
        recordId: 'record-id',
        displayName: '[test] ]] [test]',
      }),
    ).toBe('[[record:company:record-id:[test] ]] [test][[/record]]');
  });
});
