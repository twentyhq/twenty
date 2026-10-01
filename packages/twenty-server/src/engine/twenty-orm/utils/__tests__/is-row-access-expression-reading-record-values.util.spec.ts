/* @license Enterprise */

import { RecordShareAccessLevel } from 'twenty-shared/types';

import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { WORKFLOW_RUN_OF_SHARED_WORKFLOW_SHARING_RULE } from 'src/engine/core-modules/workflow/utils/workflow-run-of-shared-workflow-sharing-rule.util';
import { type RowAccessExpression } from 'src/engine/twenty-orm/types/row-access-policy.type';
import { isRowAccessExpressionReadingRecordValues } from 'src/engine/twenty-orm/utils/is-row-access-expression-reading-record-values.util';

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
};

describe('isRowAccessExpressionReadingRecordValues', () => {
  it('finds a role filter nested in and/or', () => {
    expect(
      isRowAccessExpressionReadingRecordValues({
        kind: 'or',
        operands: [{ kind: 'and', operands: [roleFilter] }, recordShared],
      }),
    ).toBe(true);
  });

  it('ignores expressions reading only shares', () => {
    expect(
      isRowAccessExpressionReadingRecordValues({
        kind: 'and',
        operands: [
          recordShared,
          { ...recordShared, kind: 'recordNotRestricted' },
        ],
      }),
    ).toBe(false);
  });

  it('counts a sharing rule, which reads the record values', () => {
    expect(
      isRowAccessExpressionReadingRecordValues({
        kind: 'or',
        operands: [
          recordShared,
          {
            kind: 'sharingRule',
            tableAlias: 'workflowRun',
            rule: WORKFLOW_RUN_OF_SHARED_WORKFLOW_SHARING_RULE,
          },
        ],
      }),
    ).toBe(true);
  });
});
