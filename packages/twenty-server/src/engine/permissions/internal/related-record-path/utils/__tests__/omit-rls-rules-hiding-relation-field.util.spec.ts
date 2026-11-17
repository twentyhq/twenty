import { type RowLevelRecordsPermissions } from 'twenty-shared/types';

import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/constants/no-role-records-permissions.constant';
import { omitRlsRulesHidingRelationField } from 'src/engine/permissions/internal/related-record-path/utils/omit-rls-rules-hiding-relation-field.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const OBJECT_ID = 'message';
const RELATION_FIELD_ID = 'attachments';

const buildReadRule = (
  rule: Partial<RowLevelRecordsPermissions> & { ruleId: string },
): RowLevelRecordsPermissions => ({
  canCreateRecords: false,
  canReadRecords: true,
  canUpdateRecords: false,
  canSoftDeleteRecords: false,
  canDestroyRecords: false,
  predicates: [],
  predicateGroups: [],
  unreadableFields: [],
  uneditableFields: [],
  ...rule,
});

const buildRole = (
  rowLevelRecordsPermissions: RowLevelRecordsPermissions[],
): RoleRecordsPermissions => ({
  ...NO_ROLE_RECORDS_PERMISSIONS,
  objects: {
    [OBJECT_ID]: {
      canCreateAllRecords: false,
      canReadAllRecords: false,
      canUpdateAllRecords: false,
      canSoftDeleteAllRecords: false,
      canDestroyAllRecords: false,
      unreadableFields: [],
      uneditableFields: [],
      rowLevelRecordsPermissions,
    },
  },
});

describe('omitRlsRulesHidingRelationField', () => {
  const fullRule = buildReadRule({ ruleId: 'full' });
  const metadataRule = buildReadRule({
    ruleId: 'metadata',
    unreadableFields: ['text', RELATION_FIELD_ID],
  });

  it('keeps only the rules that leave the relation readable', () => {
    const rolesPermissions = {
      personal: buildRole([fullRule, metadataRule]),
    };

    const result = omitRlsRulesHidingRelationField({
      rolesPermissions,
      roleIds: ['personal'],
      objectMetadataId: OBJECT_ID,
      relationFieldMetadataId: RELATION_FIELD_ID,
    });

    expect(
      result.personal.objects[OBJECT_ID]?.rowLevelRecordsPermissions,
    ).toEqual([fullRule]);
    expect(
      rolesPermissions.personal.objects[OBJECT_ID]?.rowLevelRecordsPermissions,
    ).toHaveLength(2);
  });

  it('leaves the roles it was not asked about and the ones hiding nothing untouched', () => {
    const rolesPermissions = {
      personal: buildRole([fullRule]),
      other: buildRole([metadataRule]),
    };

    const result = omitRlsRulesHidingRelationField({
      rolesPermissions,
      roleIds: ['personal', 'missing'],
      objectMetadataId: OBJECT_ID,
      relationFieldMetadataId: RELATION_FIELD_ID,
    });

    expect(result.personal).toBe(rolesPermissions.personal);
    expect(result.other).toBe(rolesPermissions.other);
  });
});
