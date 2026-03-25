import { extractObjectSingularNameFromTargetColumnName } from 'src/modules/timeline/utils/extract-object-singular-name-from-target-column-name.util';

describe('extractObjectSingularNameFromTargetColumnName', () => {
  it('should extract "person" from "targetPersonId"', () => {
    expect(
      extractObjectSingularNameFromTargetColumnName('targetPersonId'),
    ).toBe('person');
  });

  it('should extract "arrowTarget" from "targetArrowTargetId"', () => {
    expect(
      extractObjectSingularNameFromTargetColumnName('targetArrowTargetId'),
    ).toBe('arrowTarget');
  });

  it('should extract "idCard" from "targetIdCardId"', () => {
    expect(
      extractObjectSingularNameFromTargetColumnName('targetIdCardId'),
    ).toBe('idCard');
  });

  it('should extract "cardId" from "targetCardIdId"', () => {
    expect(
      extractObjectSingularNameFromTargetColumnName('targetCardIdId'),
    ).toBe('cardId');
  });
});
