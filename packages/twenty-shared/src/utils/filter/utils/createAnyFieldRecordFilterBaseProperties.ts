import { type PartialFieldMetadataItem } from '@/types';
import { type RecordFilter } from '@/utils/filter';

export const createAnyFieldRecordFilterBaseProperties = ({
  filterValue,
  fieldMetadataItem,
}: {
  filterValue: string;
  fieldMetadataItem: PartialFieldMetadataItem;
}): Pick<
  RecordFilter,
  'id' | 'value' | 'fieldMetadataId'
> => {
  return {
    id: crypto.randomUUID(),
    value: filterValue,
    fieldMetadataId: fieldMetadataItem.id,
  };
};
