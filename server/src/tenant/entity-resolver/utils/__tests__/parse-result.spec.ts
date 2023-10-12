import {
  isSpecialKey,
  handleSpecialKey,
  parseResult,
} from 'src/tenant/entity-resolver/utils/parse-result.util';

describe('isSpecialKey', () => {
  test('should return true if the key starts with "___"', () => {
    expect(isSpecialKey('___specialKey')).toBe(true);
  });

  test('should return false if the key does not start with "___"', () => {
    expect(isSpecialKey('normalKey')).toBe(false);
  });
});

describe('handleSpecialKey', () => {
  let result;

  beforeEach(() => {
    result = {};
  });

  test('should correctly process a special key and add it to the result object', () => {
    handleSpecialKey(result, '___complexField_link', 'value1');
    expect(result).toEqual({
      complexField: {
        link: 'value1',
      },
    });
  });

  test('should add values under the same newKey if called multiple times', () => {
    handleSpecialKey(result, '___complexField_link', 'value1');
    handleSpecialKey(result, '___complexField_text', 'value2');
    expect(result).toEqual({
      complexField: {
        link: 'value1',
        text: 'value2',
      },
    });
  });

  test('should not create a new field if the special key is not correctly formed', () => {
    handleSpecialKey(result, '___complexField', 'value1');
    expect(result).toEqual({});
  });
});

describe('parseResult', () => {
  test('should recursively parse an object and handle special keys', () => {
    const obj = {
      normalField: 'value1',
      ___specialField_part1: 'value2',
      nested: {
        ___specialFieldNested_part2: 'value3',
      },
    };

    const expectedResult = {
      normalField: 'value1',
      specialField: {
        part1: 'value2',
      },
      nested: {
        specialFieldNested: {
          part2: 'value3',
        },
      },
    };

    expect(parseResult(obj)).toEqual(expectedResult);
  });

  test('should handle arrays and parse each element', () => {
    const objArray = [
      {
        ___specialField_part1: 'value1',
      },
      {
        ___specialField_part2: 'value2',
      },
    ];

    const expectedResult = [
      {
        specialField: {
          part1: 'value1',
        },
      },
      {
        specialField: {
          part2: 'value2',
        },
      },
    ];

    expect(parseResult(objArray)).toEqual(expectedResult);
  });

  test('should return the original value if it is not an object or array', () => {
    expect(parseResult('stringValue')).toBe('stringValue');
    expect(parseResult(12345)).toBe(12345);
  });
});
