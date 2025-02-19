import { STANDARD_OBJECT_RECORDS_UNDER_OBJECT_RECORDS_PERMISSIONS } from 'src/constants';

export const isObjectRecordUnderObjectRecordsPermissions = ({
  isCustom,
  nameSingular,
}: {
  isCustom: boolean;
  nameSingular: string;
}) => {
  return (
    isCustom ||
    STANDARD_OBJECT_RECORDS_UNDER_OBJECT_RECORDS_PERMISSIONS.includes(
      nameSingular,
    )
  );
};
