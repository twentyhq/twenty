/* @license Enterprise */

import { type RowLevelRecordsPermissions } from 'twenty-shared/types';

export const isFieldHiddenFromRule = ({
  rowLevelRecordsPermissions,
  fieldMetadataId,
}: {
  rowLevelRecordsPermissions: Pick<
    RowLevelRecordsPermissions,
    'unreadableFields'
  >;
  fieldMetadataId: string;
}): boolean =>
  (rowLevelRecordsPermissions.unreadableFields ?? []).includes(fieldMetadataId);
