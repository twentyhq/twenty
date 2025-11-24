import { upsertIntoArrayOfObjectsComparingId } from '@/utils/array/upsertIntoArrayOfObjectComparingId';

type TestObject = {
  id: string;
  name: string;
};

const mockTestObjects: TestObject[] = [
  {
    id: '1',
    name: 'Test 1',
  },
  {
    id: '2',
    name: 'Test 2',
  },
  {
    id: '3',
    name: 'Test 3',
  },
  {
    id: '4',
    name: 'Test 4',
  },
];

describe('upsertIntoArrayOfObjectsComparingId', () => {
  it('should insert in empty array', () => {
    expect(
      upsertIntoArrayOfObjectsComparingId([], mockTestObjects[0]),
    ).toStrictEqual([mockTestObjects[0]]);
  });

  it('should insert in array', () => {
    const newItem: TestObject = {
      id: '5',
      name: 'Test 5',
    };

    expect(
      upsertIntoArrayOfObjectsComparingId(mockTestObjects, newItem),
    ).toStrictEqual([...mockTestObjects, newItem]);
  });

  it('should replace in array', () => {
    const itemToReplace: TestObject = {
      id: '4',
      name: 'Test 4 replaced',
    };

    expect(
      upsertIntoArrayOfObjectsComparingId(mockTestObjects, itemToReplace),
    ).toStrictEqual([
      mockTestObjects[0],
      mockTestObjects[1],
      mockTestObjects[2],
      itemToReplace,
    ]);
  });
});
