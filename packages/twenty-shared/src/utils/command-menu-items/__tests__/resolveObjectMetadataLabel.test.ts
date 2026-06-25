import { resolveObjectMetadataLabel } from '../resolveObjectMetadataLabel';

describe('resolveObjectMetadataLabel', () => {
  const objectMetadataItem = {
    labelSingular: 'person',
    labelPlural: 'people',
  };

  it('should return labelSingular when numberOfSelectedRecords is 1', () => {
    expect(
      resolveObjectMetadataLabel({
        objectMetadataItem,
        numberOfSelectedRecords: 1,
      }),
    ).toBe('person');
  });

  it('should return labelPlural when numberOfSelectedRecords is 0', () => {
    expect(
      resolveObjectMetadataLabel({
        objectMetadataItem,
        numberOfSelectedRecords: 0,
      }),
    ).toBe('people');
  });

  it('should return labelPlural when numberOfSelectedRecords is greater than 1', () => {
    expect(
      resolveObjectMetadataLabel({
        objectMetadataItem,
        numberOfSelectedRecords: 5,
      }),
    ).toBe('people');
  });
});
