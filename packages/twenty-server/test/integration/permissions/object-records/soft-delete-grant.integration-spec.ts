import { describeObjectRecordGrantTable } from 'test/integration/permissions/utils/describe-object-record-grant-table.util';

describe('object record soft-delete grant', () => {
  describeObjectRecordGrantTable('softDelete');
});
