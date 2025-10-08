import { type PartialFieldMetadataItem } from '@/types';

export const filterSelectOptionsOfFieldMetadataItem = ({
  fieldMetadataItem,
  filterValue,
}: {
  fieldMetadataItem: PartialFieldMetadataItem;
  filterValue: string;
}) => {
  const selectOptions = fieldMetadataItem.options;

  const foundCorrespondingSelectOptions = selectOptions?.filter(
    (selectOption) =>
      selectOption.value
        .toLocaleLowerCase()
        .includes(filterValue.toLocaleLowerCase()) ||
      selectOption.label
        .toLocaleLowerCase()
        .includes(filterValue.toLocaleLowerCase()),
  );

  return {
    foundCorrespondingSelectOptions,
  };
};
