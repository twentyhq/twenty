import { mapObjectByKey } from '@/utils/object/mapObjectByKey';

describe('mapObjectByKey', () => {
  it('should extract key properly', () => {
    const object = {
      id1: {
        result: 'result1',
      },
      id2: {
        result: 'result2',
      },
    };

    const expectedResult = {
      id1: 'result1',
      id2: 'result2',
    };

    expect(mapObjectByKey(object, 'result')).toEqual(expectedResult);
  });

  it('should handle missing key properly', () => {
    const object = {
      id1: {
        result: 'result1',
      },
      id2: {
        result: 'result2',
      },
      id3: {
        error: 'error',
      },
    };

    const expectedResult = {
      id1: 'result1',
      id2: 'result2',
    };

    expect(mapObjectByKey(object, 'result')).toEqual(expectedResult);
  });
});
