import { upsertPropertiesOfItemIntoArrayOfObjectsComparingId } from '@/utils/array/upsertPropertiesOfItemIntoArrayOfObjectsComparingId';

type TestObject = {
  id: string;
  name: string;
  value: number;
};

const mockTestObjects: TestObject[] = [
  {
    id: '1',
    name: 'Test 1',
    value: 100,
  },
  {
    id: '2',
    name: 'Test 2',
    value: 200,
  },
  {
    id: '3',
    name: 'Test 3',
    value: 300,
  },
];

describe('upsertPropertiesOfItemIntoArrayOfObjectsComparingId', () => {
  it('should insert partial properties into empty array', () => {
    const partialItem = { id: '1', name: 'New Item' };

    expect(
      upsertPropertiesOfItemIntoArrayOfObjectsComparingId<TestObject>(
        [],
        partialItem,
      ),
    ).toStrictEqual([partialItem]);
  });

  it('should append item when id does not exist', () => {
    const newItem: TestObject = {
      id: '4',
      name: 'Test 4',
      value: 400,
    };

    expect(
      upsertPropertiesOfItemIntoArrayOfObjectsComparingId(
        mockTestObjects,
        newItem,
      ),
    ).toStrictEqual([...mockTestObjects, newItem]);
  });

  it('should merge partial properties into existing item', () => {
    const partialUpdate = { id: '2', name: 'Updated Test 2' };

    expect(
      upsertPropertiesOfItemIntoArrayOfObjectsComparingId(
        mockTestObjects,
        partialUpdate,
      ),
    ).toStrictEqual([
      mockTestObjects[0],
      { id: '2', name: 'Updated Test 2', value: 200 },
      mockTestObjects[2],
    ]);
  });

  it('should replace all properties when full item is provided', () => {
    const fullUpdate: TestObject = {
      id: '1',
      name: 'Replaced Test 1',
      value: 999,
    };

    expect(
      upsertPropertiesOfItemIntoArrayOfObjectsComparingId(
        mockTestObjects,
        fullUpdate,
      ),
    ).toStrictEqual([fullUpdate, mockTestObjects[1], mockTestObjects[2]]);
  });

  it('should not mutate original array when updating', () => {
    const originalArray = [...mockTestObjects];
    const partialUpdate = { id: '2', value: 999 };

    upsertPropertiesOfItemIntoArrayOfObjectsComparingId(
      mockTestObjects,
      partialUpdate,
    );

    expect(mockTestObjects).toStrictEqual(originalArray);
  });

  it('should not mutate original array when inserting', () => {
    const originalArray = [...mockTestObjects];
    const newItem: TestObject = { id: '5', name: 'Test 5', value: 500 };

    upsertPropertiesOfItemIntoArrayOfObjectsComparingId(
      mockTestObjects,
      newItem,
    );

    expect(mockTestObjects).toStrictEqual(originalArray);
  });
});
