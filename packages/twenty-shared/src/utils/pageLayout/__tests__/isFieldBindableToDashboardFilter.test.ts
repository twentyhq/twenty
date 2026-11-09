import { FieldMetadataType, PageLayoutFilterType } from '@/types';
import { isFieldBindableToDashboardFilter } from '@/utils/pageLayout/isFieldBindableToDashboardFilter';

describe('isFieldBindableToDashboardFilter', () => {
  it.each([
    ['closeDate', FieldMetadataType.DATE, true],
    ['createdAt', FieldMetadataType.DATE_TIME, true],
    ['name', FieldMetadataType.TEXT, false],
    ['deletedAt', FieldMetadataType.DATE_TIME, false],
  ])(
    'should tell whether field %s of type %s can be bound to a date filter',
    (name, type, isBindable) => {
      expect(
        isFieldBindableToDashboardFilter({
          field: { name, type },
          filterType: PageLayoutFilterType.DATE,
        }),
      ).toBe(isBindable);
    },
  );
});
