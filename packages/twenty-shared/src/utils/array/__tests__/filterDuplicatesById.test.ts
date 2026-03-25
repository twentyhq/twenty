import { filterDuplicatesById } from '@/utils/array/filterDuplicatesById';

type ObjectRecordTest = { id: string };

describe('filterDuplicatesById', () => {
  it('should work with empty array', () => {
    const array: ObjectRecordTest[] = [];

    const filteredArray = array.filter(filterDuplicatesById);

    expect(filteredArray).toEqual([]);
  });

  it('should work with no duplicates', () => {
    const array: ObjectRecordTest[] = [
      {
        id: '1',
      },
      {
        id: '2',
      },
    ];

    const filteredArray = array.filter(filterDuplicatesById);

    expect(filteredArray).toEqual(array);
  });

  it('should work with one duplicate', () => {
    const array: ObjectRecordTest[] = [
      {
        id: '1',
      },
      {
        id: '1',
      },
    ];

    const filteredArray = array.filter(filterDuplicatesById);

    expect(filteredArray).toEqual([{ id: '1' }]);
  });

  it('should work with multiple duplicates', () => {
    const array: ObjectRecordTest[] = [
      {
        id: '1',
      },
      {
        id: '1',
      },
      {
        id: '2',
      },
      {
        id: '3',
      },
      {
        id: '3',
      },
    ];

    const filteredArray = array.filter(filterDuplicatesById);

    expect(filteredArray).toEqual([
      {
        id: '1',
      },
      {
        id: '2',
      },
      {
        id: '3',
      },
    ]);
  });
});
