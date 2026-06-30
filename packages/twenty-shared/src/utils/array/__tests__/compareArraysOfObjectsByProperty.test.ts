import { compareArraysOfObjectsByProperty } from '@/utils/array/compareArraysOfObjectsByProperty';

type TestObject = {
  id: string;
  name: string;
};

describe('compareArraysOfObjectsByProperty', () => {
  it('should return false when both arrays are empty', () => {
    expect(compareArraysOfObjectsByProperty([], [], 'id')).toBe(false);
  });

  it('should return false when arrays have same objects by property', () => {
    const arrayA: TestObject[] = [
      { id: '1', name: 'Test 1' },
      { id: '2', name: 'Test 2' },
    ];
    const arrayB: TestObject[] = [
      { id: '1', name: 'Different Name' },
      { id: '2', name: 'Another Name' },
    ];

    expect(compareArraysOfObjectsByProperty(arrayA, arrayB, 'id')).toBe(false);
  });

  it('should return true when arrays have different lengths', () => {
    const arrayA: TestObject[] = [
      { id: '1', name: 'Test 1' },
      { id: '2', name: 'Test 2' },
    ];
    const arrayB: TestObject[] = [{ id: '1', name: 'Test 1' }];

    expect(compareArraysOfObjectsByProperty(arrayA, arrayB, 'id')).toBe(true);
  });

  it('should return true when arrayA has items not in arrayB', () => {
    const arrayA: TestObject[] = [
      { id: '1', name: 'Test 1' },
      { id: '2', name: 'Test 2' },
    ];
    const arrayB: TestObject[] = [
      { id: '1', name: 'Test 1' },
      { id: '3', name: 'Test 3' },
    ];

    expect(compareArraysOfObjectsByProperty(arrayA, arrayB, 'id')).toBe(true);
  });

  it('should return true when arrayB has items not in arrayA', () => {
    const arrayA: TestObject[] = [
      { id: '1', name: 'Test 1' },
      { id: '3', name: 'Test 3' },
    ];
    const arrayB: TestObject[] = [
      { id: '1', name: 'Test 1' },
      { id: '2', name: 'Test 2' },
    ];

    expect(compareArraysOfObjectsByProperty(arrayA, arrayB, 'id')).toBe(true);
  });

  it('should return false when arrays have same items in different order', () => {
    const arrayA: TestObject[] = [
      { id: '1', name: 'Test 1' },
      { id: '2', name: 'Test 2' },
      { id: '3', name: 'Test 3' },
    ];
    const arrayB: TestObject[] = [
      { id: '3', name: 'Test 3' },
      { id: '1', name: 'Test 1' },
      { id: '2', name: 'Test 2' },
    ];

    expect(compareArraysOfObjectsByProperty(arrayA, arrayB, 'id')).toBe(false);
  });

  it('should compare by the specified property', () => {
    const arrayA: TestObject[] = [
      { id: '1', name: 'Alpha' },
      { id: '2', name: 'Beta' },
    ];
    const arrayB: TestObject[] = [
      { id: '3', name: 'Alpha' },
      { id: '4', name: 'Beta' },
    ];

    expect(compareArraysOfObjectsByProperty(arrayA, arrayB, 'name')).toBe(
      false,
    );
    expect(compareArraysOfObjectsByProperty(arrayA, arrayB, 'id')).toBe(true);
  });
});
