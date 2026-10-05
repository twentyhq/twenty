/* @license Enterprise */

import { RecordShareAccessLevel } from 'twenty-shared/types';

import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { type RowAccessExpression } from 'src/engine/twenty-orm/types/row-access-policy.type';
import { isRowAccessExpressionReadingRoleFilter } from 'src/engine/twenty-orm/utils/is-row-access-expression-reading-role-filter.util';

const recordShared: RowAccessExpression = {
  kind: 'recordShared',
  tableAlias: 'company',
  objectMetadataId: COMPANY_FLAT_OBJECT_MOCK.id,
  principalIds: ['member-1'],
  accessLevels: [RecordShareAccessLevel.READ_WRITE],
};

const roleFilter: RowAccessExpression = {
  kind: 'roleFilter',
  tableAlias: 'company',
  flatObjectMetadata: COMPANY_FLAT_OBJECT_MOCK,
  recordFilter: { name: { eq: 'Acme' } },
  condition: { sql: 'TRUE', parameters: {} },
};

describe('isRowAccessExpressionReadingRoleFilter', () => {
  it('finds a role filter nested in and/or', () => {
    expect(
      isRowAccessExpressionReadingRoleFilter({
        kind: 'or',
        operands: [{ kind: 'and', operands: [roleFilter] }, recordShared],
      }),
    ).toBe(true);
  });

  it('ignores expressions reading only shares', () => {
    expect(
      isRowAccessExpressionReadingRoleFilter({
        kind: 'and',
        operands: [
          recordShared,
          { ...recordShared, kind: 'recordNotRestricted' },
          {
            ...recordShared,
            kind: 'inheritedReadability',
            parents: [],
            isOpenWhenDetached: false,
          },
        ],
      }),
    ).toBe(false);
  });
});
