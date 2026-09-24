import { chunkRecipientsToAdmissibleSize } from 'src/modules/emailing/utils/chunk-recipients-to-admissible-size.util';

describe('chunkRecipientsToAdmissibleSize', () => {
  it('keeps the batch whole when it already fits the limit', () => {
    expect(
      chunkRecipientsToAdmissibleSize({
        recipients: [1, 2, 3],
        limitValue: 10,
      }),
    ).toEqual([[1, 2, 3]]);
  });

  it('splits a batch the limit can never admit whole', () => {
    expect(
      chunkRecipientsToAdmissibleSize({
        recipients: [1, 2, 3, 4, 5],
        limitValue: 2,
      }),
    ).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('splits to single sends when only one slot per window is allowed', () => {
    expect(
      chunkRecipientsToAdmissibleSize({ recipients: [1, 2], limitValue: 1 }),
    ).toEqual([[1], [2]]);
  });

  it('keeps the batch whole when the limit is unknown', () => {
    expect(
      chunkRecipientsToAdmissibleSize({ recipients: [1, 2], limitValue: null }),
    ).toEqual([[1, 2]]);
  });

  it('keeps the batch whole rather than looping forever on a zero limit', () => {
    expect(
      chunkRecipientsToAdmissibleSize({ recipients: [1, 2], limitValue: 0 }),
    ).toEqual([[1, 2]]);
  });

  it('rounds a fractional limit down to whole recipients', () => {
    expect(
      chunkRecipientsToAdmissibleSize({
        recipients: [1, 2, 3],
        limitValue: 2.7,
      }),
    ).toEqual([[1, 2], [3]]);
  });
});
