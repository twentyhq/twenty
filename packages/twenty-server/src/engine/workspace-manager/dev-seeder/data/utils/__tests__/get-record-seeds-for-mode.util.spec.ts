import { getRecordSeedsForMode } from 'src/engine/workspace-manager/dev-seeder/data/utils/get-record-seeds-for-mode.util';

describe('getRecordSeedsForMode', () => {
  const records = Array.from({ length: 10 }, (_, index) => ({ index }));

  it('limits light seed data to five deterministic records', () => {
    expect(getRecordSeedsForMode(records, true)).toEqual(records.slice(0, 5));
  });

  it('preserves the complete dataset for the normal dev seed', () => {
    expect(getRecordSeedsForMode(records, false)).toEqual(records);
  });
});
