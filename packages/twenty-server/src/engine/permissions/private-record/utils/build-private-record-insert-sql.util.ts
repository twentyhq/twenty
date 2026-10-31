/* @license Enterprise */

import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/permissions/private-record/constants/is-private-column-name.constant';

export type PrivateRecordInsertSql = {
  privateColumn: string;
  privateValue: string;
};

export const buildPrivateRecordInsertSql = ({
  isPrivateRecordEnabled,
}: {
  isPrivateRecordEnabled: boolean;
}): PrivateRecordInsertSql =>
  isPrivateRecordEnabled
    ? { privateColumn: `, "${IS_PRIVATE_COLUMN_NAME}"`, privateValue: ', true' }
    : { privateColumn: '', privateValue: '' };
