import { getRowLevelPermissionRuleUniversalIdentifier } from '@/application/deterministic-identifier/get-row-level-permission-rule-universal-identifier.util';
import { type LegacyCompliantRoleManifest } from '@/application/roleManifestType';
import { normalizeLegacyCompliantRoleManifest } from '@/application/utils/normalizeLegacyCompliantRoleManifest';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from '@/types';

const APPLICATION = '20202020-0000-4000-8000-000000000001';
const ROLE = { universalIdentifier: 'role', label: 'Role' };

const normalize = (
  role: Omit<LegacyCompliantRoleManifest, 'universalIdentifier' | 'label'>,
) =>
  normalizeLegacyCompliantRoleManifest({
    role: { ...ROLE, ...role },
    applicationUniversalIdentifier: APPLICATION,
  });

const NO_ALL_RECORDS_PERMISSIONS = {
  canReadAllRecords: false,
  canCreateAllRecords: false,
  canUpdateAllRecords: false,
  canSoftDeleteAllRecords: false,
  canDestroyAllRecords: false,
};

describe('normalizeLegacyCompliantRoleManifest', () => {
  it('should leave a role already written with recordsPermissions as it is', () => {
    const recordsPermissions = {
      canReadAllRecords: true,
      objects: [
        {
          objectUniversalIdentifier: 'company',
          canUpdateAllRecords: true,
          unreadableFields: ['secret'],
        },
      ],
    };

    expect(normalize({ recordsPermissions })).toStrictEqual({
      ...ROLE,
      recordsPermissions,
    });
  });

  it('should move the legacy grants on all objects, object permissions and field permissions into recordsPermissions', () => {
    expect(
      normalize({
        canReadAllObjectRecords: true,
        canAccessAllTools: true,
        objectPermissions: [
          {
            universalIdentifier: 'company-permission',
            objectUniversalIdentifier: 'company',
            canUpdateObjectRecords: true,
          },
        ],
        fieldPermissions: [
          {
            objectUniversalIdentifier: 'company',
            fieldUniversalIdentifier: 'secret',
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
          {
            universalIdentifier: 'person-email-permission',
            objectUniversalIdentifier: 'person',
            fieldUniversalIdentifier: 'email',
            canUpdateFieldValue: false,
          },
        ],
      }),
    ).toStrictEqual({
      ...ROLE,
      canAccessAllTools: true,
      recordsPermissions: {
        canReadAllRecords: true,
        objects: [
          {
            universalIdentifier: 'company-permission',
            objectUniversalIdentifier: 'company',
            canUpdateAllRecords: true,
            unreadableFields: ['secret'],
            uneditableFields: ['secret'],
          },
          {
            objectUniversalIdentifier: 'person',
            uneditableFields: ['email'],
            fieldPermissionIdentifiers: [
              {
                fieldUniversalIdentifier: 'email',
                universalIdentifier: 'person-email-permission',
              },
            ],
          },
        ],
      },
    });
  });

  it('should turn the predicates declared on the role into rules that take the grants of their object over', () => {
    const { recordsPermissions } = normalize({
      canDestroyAllObjectRecords: true,
      objectPermissions: [
        {
          objectUniversalIdentifier: 'company',
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
        },
      ],
      rowLevelPermissionPredicateGroups: [
        {
          universalIdentifier: 'group',
          objectUniversalIdentifier: 'company',
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
        },
      ],
      rowLevelPermissionPredicates: [
        {
          universalIdentifier: 'predicate-in-group',
          objectUniversalIdentifier: 'company',
          fieldUniversalIdentifier: 'owner',
          operand: RowLevelPermissionPredicateOperand.IS,
          predicateGroupUniversalIdentifier: 'group',
        },
        {
          universalIdentifier: 'ungrouped-predicate',
          objectUniversalIdentifier: 'person',
          fieldUniversalIdentifier: 'owner',
          operand: RowLevelPermissionPredicateOperand.IS,
        },
      ],
    });

    expect(recordsPermissions).toStrictEqual({
      canDestroyAllRecords: true,
      objects: [
        {
          objectUniversalIdentifier: 'company',
          ...NO_ALL_RECORDS_PERMISSIONS,
          rowLevelRecordsPermissions: [
            {
              universalIdentifier: getRowLevelPermissionRuleUniversalIdentifier(
                {
                  applicationUniversalIdentifier: APPLICATION,
                  roleUniversalIdentifier: ROLE.universalIdentifier,
                  objectMetadataUniversalIdentifier: 'company',
                  rootRowLevelPermissionPredicateGroupUniversalIdentifier:
                    'group',
                },
              ),
              canReadRecords: true,
              canCreateRecords: true,
              canUpdateRecords: true,
              canSoftDeleteRecords: false,
              canDestroyRecords: true,
              predicateGroups: [
                {
                  universalIdentifier: 'group',
                  logicalOperator:
                    RowLevelPermissionPredicateGroupLogicalOperator.OR,
                  predicates: [
                    {
                      universalIdentifier: 'predicate-in-group',
                      fieldUniversalIdentifier: 'owner',
                      operand: RowLevelPermissionPredicateOperand.IS,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          objectUniversalIdentifier: 'person',
          ...NO_ALL_RECORDS_PERMISSIONS,
          rowLevelRecordsPermissions: [
            {
              universalIdentifier: getRowLevelPermissionRuleUniversalIdentifier(
                {
                  applicationUniversalIdentifier: APPLICATION,
                  roleUniversalIdentifier: ROLE.universalIdentifier,
                  objectMetadataUniversalIdentifier: 'person',
                  rootRowLevelPermissionPredicateGroupUniversalIdentifier: null,
                },
              ),
              canReadRecords: false,
              canCreateRecords: false,
              canUpdateRecords: false,
              canSoftDeleteRecords: false,
              canDestroyRecords: true,
              predicates: [
                {
                  universalIdentifier: 'ungrouped-predicate',
                  fieldUniversalIdentifier: 'owner',
                  operand: RowLevelPermissionPredicateOperand.IS,
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('should give a derived rule the default access of its object when the role declares none', () => {
    const { recordsPermissions } = normalizeLegacyCompliantRoleManifest({
      role: {
        ...ROLE,
        canUpdateAllObjectRecords: true,
        rowLevelPermissionPredicates: [
          {
            universalIdentifier: 'message-predicate',
            objectUniversalIdentifier: 'message',
            fieldUniversalIdentifier: 'owner',
            operand: RowLevelPermissionPredicateOperand.IS,
          },
          {
            universalIdentifier: 'association-predicate',
            objectUniversalIdentifier: 'association',
            fieldUniversalIdentifier: 'owner',
            operand: RowLevelPermissionPredicateOperand.IS,
          },
        ],
      },
      applicationUniversalIdentifier: APPLICATION,
      objectDefaultsByUniversalIdentifier: {
        message: { isSystem: true },
        association: {
          isSystem: false,
          disabledObjectPermissionActions: ['canUpdateObjectRecords'],
        },
      },
    });

    expect(
      recordsPermissions.objects.map(
        ({ objectUniversalIdentifier, rowLevelRecordsPermissions }) => ({
          objectUniversalIdentifier,
          canReadRecords: rowLevelRecordsPermissions?.[0]?.canReadRecords,
          canUpdateRecords: rowLevelRecordsPermissions?.[0]?.canUpdateRecords,
        }),
      ),
    ).toStrictEqual([
      {
        objectUniversalIdentifier: 'message',
        canReadRecords: true,
        canUpdateRecords: true,
      },
      {
        objectUniversalIdentifier: 'association',
        canReadRecords: false,
        canUpdateRecords: false,
      },
    ]);
  });
});
