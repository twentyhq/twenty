import {
  type ObjectRecordsPermissions,
  type RowLevelRecordsPermissions,
} from 'twenty-shared/types';

import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';
import { omitPermissionsUnableToReadField } from 'src/engine/permissions/internal/related-record-path/utils/omit-permissions-unable-to-read-field.util';

const buildRule = ({
  ruleId,
  unreadableFields,
}: {
  ruleId: string;
  unreadableFields: string[];
}): RowLevelRecordsPermissions => ({
  ruleId,
  canCreateRecords: false,
  canReadRecords: true,
  canUpdateRecords: false,
  canSoftDeleteRecords: false,
  canDestroyRecords: false,
  predicates: [],
  predicateGroups: [],
  unreadableFields,
  uneditableFields: [],
});

const buildCompanyPermissions = (
  companyPermissions: Partial<ObjectRecordsPermissions>,
): { rolesPermissions: Record<string, RoleRecordsPermissions> } => ({
  rolesPermissions: {
    sales: {
      canReadAllRecords: true,
      canUpdateAllRecords: true,
      canSoftDeleteAllRecords: true,
      canDestroyAllRecords: true,
      objects: {
        company: {
          canCreateAllRecords: true,
          canReadAllRecords: true,
          canUpdateAllRecords: true,
          canSoftDeleteAllRecords: true,
          canDestroyAllRecords: true,
          unreadableFields: [],
          uneditableFields: [],
          ...companyPermissions,
        },
      },
    },
  },
});

const findSalesCompanyPermissions = (
  metadataMaps: ReturnType<typeof buildCompanyPermissions>,
) => metadataMaps.rolesPermissions.sales.objects.company;

describe('omitPermissionsUnableToReadField', () => {
  it('should take every record of the object away from a role that cannot read the field on any of them', () => {
    expect(
      findSalesCompanyPermissions(
        omitPermissionsUnableToReadField({
          metadataMaps: buildCompanyPermissions({
            unreadableFields: ['companyOpportunities'],
            rowLevelRecordsPermissions: [
              buildRule({ ruleId: 'paris', unreadableFields: [] }),
            ],
          }),
          objectMetadataId: 'company',
          fieldMetadataId: 'companyOpportunities',
        }),
      ),
    ).toMatchObject({
      canCreateAllRecords: true,
      canReadAllRecords: false,
      canUpdateAllRecords: false,
      canSoftDeleteAllRecords: false,
      canDestroyAllRecords: false,
      rowLevelRecordsPermissions: [],
    });
  });

  it('should keep only the rules that can read the field', () => {
    expect(
      findSalesCompanyPermissions(
        omitPermissionsUnableToReadField({
          metadataMaps: buildCompanyPermissions({
            canReadAllRecords: false,
            rowLevelRecordsPermissions: [
              buildRule({
                ruleId: 'paris',
                unreadableFields: ['companyOpportunities'],
              }),
              buildRule({ ruleId: 'london', unreadableFields: [] }),
            ],
          }),
          objectMetadataId: 'company',
          fieldMetadataId: 'companyOpportunities',
        }),
      )?.rowLevelRecordsPermissions?.map(({ ruleId }) => ruleId),
    ).toEqual(['london']);
  });

  it('should keep every rule when every role and rule can read the field', () => {
    const metadataMaps = buildCompanyPermissions({
      unreadableFields: ['companyName'],
    });

    expect(
      findSalesCompanyPermissions(
        omitPermissionsUnableToReadField({
          metadataMaps,
          objectMetadataId: 'company',
          fieldMetadataId: 'companyOpportunities',
        }),
      ),
    ).toEqual({
      ...findSalesCompanyPermissions(metadataMaps),
      rowLevelRecordsPermissions: [],
    });
  });
});
