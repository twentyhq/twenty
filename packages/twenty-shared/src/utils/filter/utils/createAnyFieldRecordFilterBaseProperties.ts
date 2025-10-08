import { type PartialFieldMetadataItem } from '@/types';
import { type RecordFilter } from '@/utils/filter';
import { v4 } from 'uuid';

export const createAnyFieldRecordFilterBaseProperties = ({
  filterValue,
  fieldMetadataItem,
}: {
  filterValue: string;
  fieldMetadataItem: PartialFieldMetadataItem;
}): Pick<RecordFilter, 'id' | 'value' | 'fieldMetadataId'> => {
  return {
    id: v4(),
    value: filterValue,
    fieldMetadataId: fieldMetadataItem.id,
  };
};
