import { type ObjectRecordsPermissions } from 'twenty-shared/types';

import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { omitRolesHidingField } from 'src/engine/permissions/internal/related-record-path/utils/omit-roles-hiding-field.util';

const buildRule = ({
  ruleId,
  unreadableFields,
}: {
  ruleId: string;
  unreadableFields: string[];
}) => ({
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
) =>
  ({
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
  }) as unknown as PermissionsMetadataMaps;

const findSalesCompanyPermissions = (metadataMaps: PermissionsMetadataMaps) =>
  metadataMaps.rolesPermissions.sales.objects.company;

describe('omitRolesHidingField', () => {
  it('should take every record of the object away from a role hiding the field on all of them', () => {
    expect(
      findSalesCompanyPermissions(
        omitRolesHidingField({
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

  it('should leave the permissions untouched when nothing hides the field', () => {
    const metadataMaps = buildCompanyPermissions({
      unreadableFields: ['companyName'],
    });

    expect(
      findSalesCompanyPermissions(
        omitRolesHidingField({
          metadataMaps,
          objectMetadataId: 'company',
          fieldMetadataId: 'companyOpportunities',
        }),
      ),
    ).toBe(findSalesCompanyPermissions(metadataMaps));
  });
});
