import { FieldMetadataType, type ObjectPermissions } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ApplicationDefaultRoleMaps } from 'src/engine/twenty-orm/types/application-default-role-maps.type';
import { type RoleIdsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { computeObjectsPermissionsForRolePermissionConfig } from 'src/engine/twenty-orm/utils/compute-objects-permissions-for-role-permission-config.util';

const INVOICE_ID = 'invoice-id';
const AMOUNT_FIELD_ID = 'amount-field-id';

const FULL_ACCESS: ObjectPermissions = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};

const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> =
  createEmptyFlatEntityMaps();

flatObjectMetadataMaps.byUniversalIdentifier.invoice =
  getFlatObjectMetadataMock({
    id: INVOICE_ID,
    universalIdentifier: 'invoice',
    applicationId: 'owning-application-id',
    disabledObjectPermissionActions: ['canDestroyObjectRecords'],
  });
flatObjectMetadataMaps.universalIdentifierById[INVOICE_ID] = 'invoice';

const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> =
  createEmptyFlatEntityMaps();

flatFieldMetadataMaps.byUniversalIdentifier.amount = getFlatFieldMetadataMock({
  id: AMOUNT_FIELD_ID,
  universalIdentifier: 'amount',
  objectMetadataId: INVOICE_ID,
  type: FieldMetadataType.NUMBER,
  applicationId: 'owning-application-id',
  disabledFieldPermissionActions: ['canUpdateFieldValue'],
});
flatFieldMetadataMaps.universalIdentifierById[AMOUNT_FIELD_ID] = 'amount';

const flatApplicationMaps: ApplicationDefaultRoleMaps = {
  byId: {
    'owning-application-id': {
      id: 'owning-application-id',
      defaultRoleId: 'owning-application-role-id',
      deletedAt: null,
    },
    'other-application-id': {
      id: 'other-application-id',
      defaultRoleId: 'other-application-role-id',
      deletedAt: null,
    },
  },
};

const rolesPermissions = Object.fromEntries(
  [
    'user-role-id',
    'owning-application-role-id',
    'other-application-role-id',
  ].map((roleId) => [roleId, { [INVOICE_ID]: FULL_ACCESS }]),
);

describe('computeObjectsPermissionsForRolePermissionConfig', () => {
  it.each<{
    actor: string;
    intersectionOf: RoleIdsBySource;
    canDestroy: boolean;
  }>([
    {
      actor: 'the owning application',
      intersectionOf: { applicationRoleId: 'owning-application-role-id' },
      canDestroy: true,
    },
    {
      actor: 'another application',
      intersectionOf: { applicationRoleId: 'other-application-role-id' },
      canDestroy: false,
    },
    {
      actor: 'a user',
      intersectionOf: { userWorkspaceRoleId: 'user-role-id' },
      canDestroy: false,
    },
    {
      actor: 'a user through the owning application',
      intersectionOf: {
        userWorkspaceRoleId: 'user-role-id',
        applicationRoleId: 'owning-application-role-id',
      },
      canDestroy: false,
    },
    {
      actor: "a user holding the owning application's default role",
      intersectionOf: { userWorkspaceRoleId: 'owning-application-role-id' },
      canDestroy: false,
    },
    {
      actor: "an API key holding the owning application's default role",
      intersectionOf: { apiKeyRoleId: 'owning-application-role-id' },
      canDestroy: false,
    },
    {
      actor: "an agent holding the owning application's default role",
      intersectionOf: { agentRoleId: 'owning-application-role-id' },
      canDestroy: false,
    },
    {
      actor: 'the owning application with a user holding its default role',
      intersectionOf: {
        userWorkspaceRoleId: 'owning-application-role-id',
        applicationRoleId: 'owning-application-role-id',
      },
      canDestroy: false,
    },
  ])(
    'disabled actions allowed for $actor: $canDestroy',
    ({ intersectionOf, canDestroy }) => {
      const invoicePermissions =
        computeObjectsPermissionsForRolePermissionConfig({
          intersectionOf,
          rolesPermissions,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          flatApplicationMaps,
        })[INVOICE_ID];

      expect(invoicePermissions?.canDestroyObjectRecords).toBe(canDestroy);
      expect(
        invoicePermissions?.restrictedFields[AMOUNT_FIELD_ID]?.canUpdate ===
          false,
      ).toBe(!canDestroy);
      expect(
        invoicePermissions?.restrictedFields[AMOUNT_FIELD_ID]?.canRead,
      ).not.toBe(false);
    },
  );

  it('should keep the label identifier readable and restrict the inverse of a relation or morph relation', () => {
    const COMPANY_ID = 'company-id';
    const objectMaps: FlatEntityMaps<FlatObjectMetadata> =
      createEmptyFlatEntityMaps();

    objectMaps.byUniversalIdentifier.invoice = getFlatObjectMetadataMock({
      id: INVOICE_ID,
      universalIdentifier: 'invoice',
      applicationId: 'owning-application-id',
      labelIdentifierFieldMetadataId: 'invoice-name-field-id',
    });
    objectMaps.universalIdentifierById[INVOICE_ID] = 'invoice';
    objectMaps.byUniversalIdentifier.company = getFlatObjectMetadataMock({
      id: COMPANY_ID,
      universalIdentifier: 'company',
    });
    objectMaps.universalIdentifierById[COMPANY_ID] = 'company';

    const fieldMaps: FlatEntityMaps<FlatFieldMetadata> =
      createEmptyFlatEntityMaps();

    for (const flatFieldMetadata of [
      getFlatFieldMetadataMock({
        id: 'invoice-name-field-id',
        universalIdentifier: 'invoice-name',
        objectMetadataId: INVOICE_ID,
        type: FieldMetadataType.TEXT,
        applicationId: 'owning-application-id',
        disabledFieldPermissionActions: ['canReadFieldValue'],
      }),
      getFlatFieldMetadataMock({
        id: 'invoice-customer-field-id',
        universalIdentifier: 'invoice-customer',
        objectMetadataId: INVOICE_ID,
        type: FieldMetadataType.RELATION,
        applicationId: 'owning-application-id',
        relationTargetObjectMetadataId: COMPANY_ID,
        relationTargetFieldMetadataId: 'company-invoices-field-id',
        disabledFieldPermissionActions: ['canReadFieldValue'],
      }),
      getFlatFieldMetadataMock({
        id: 'invoice-payer-company-field-id',
        universalIdentifier: 'invoice-payer-company',
        objectMetadataId: INVOICE_ID,
        type: FieldMetadataType.MORPH_RELATION,
        morphId: 'invoice-payer',
        applicationId: 'owning-application-id',
        relationTargetObjectMetadataId: COMPANY_ID,
        relationTargetFieldMetadataId: 'company-paid-invoices-field-id',
        disabledFieldPermissionActions: ['canReadFieldValue'],
      }),
    ]) {
      fieldMaps.byUniversalIdentifier[flatFieldMetadata.universalIdentifier] =
        flatFieldMetadata;
      fieldMaps.universalIdentifierById[flatFieldMetadata.id] =
        flatFieldMetadata.universalIdentifier;
    }

    const objectsPermissions = computeObjectsPermissionsForRolePermissionConfig(
      {
        intersectionOf: { userWorkspaceRoleId: 'user-role-id' },
        rolesPermissions: {
          'user-role-id': {
            [INVOICE_ID]: FULL_ACCESS,
            [COMPANY_ID]: FULL_ACCESS,
          },
        },
        flatObjectMetadataMaps: objectMaps,
        flatFieldMetadataMaps: fieldMaps,
        flatApplicationMaps,
      },
    );

    expect(
      objectsPermissions[INVOICE_ID]?.restrictedFields['invoice-name-field-id']
        ?.canRead,
    ).not.toBe(false);
    expect(
      objectsPermissions[COMPANY_ID]?.restrictedFields[
        'company-invoices-field-id'
      ]?.canRead,
    ).toBe(false);
    expect(
      objectsPermissions[COMPANY_ID]?.restrictedFields[
        'company-paid-invoices-field-id'
      ]?.canRead,
    ).toBe(false);
  });
});
