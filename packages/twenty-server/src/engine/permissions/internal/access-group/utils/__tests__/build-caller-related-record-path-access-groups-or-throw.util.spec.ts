import {
  FeatureFlagKey,
  FieldMetadataType,
  type ObjectRecordsOperationType,
  type ObjectRecordsPermissions,
  RelationType,
} from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRelatedRecordPath } from 'src/engine/metadata-modules/flat-related-record-path/types/flat-related-record-path.type';
import { buildCallerRelatedRecordPathAccessGroupsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-caller-related-record-path-access-groups-or-throw.util';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

const buildFlatEntityMaps = <TEntity extends { id: string }>(
  entities: TEntity[],
) =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      entities.map((entity) => [entity.id, entity]),
    ),
    universalIdentifierById: Object.fromEntries(
      entities.map((entity) => [entity.id, entity.id]),
    ),
    universalIdentifiersByApplicationId: {},
  }) as unknown as FlatEntityMaps<never>;

const buildObject = (nameSingular: string) =>
  ({
    id: nameSingular,
    universalIdentifier: nameSingular,
    nameSingular,
  }) as FlatObjectMetadata;

const buildRelationField = ({
  id,
  objectMetadataId,
  relationTargetObjectMetadataId,
  relationType,
  joinColumnName,
  relationTargetFieldMetadataId,
}: {
  id: string;
  objectMetadataId: string;
  relationTargetObjectMetadataId: string;
  relationType: RelationType;
  joinColumnName?: string;
  relationTargetFieldMetadataId?: string;
}) =>
  ({
    id,
    universalIdentifier: id,
    name: id,
    objectMetadataId,
    type: FieldMetadataType.RELATION,
    isActive: true,
    relationTargetObjectMetadataId,
    relationTargetFieldMetadataId,
    settings: { relationType, joinColumnName },
  }) as unknown as OrmFlatFieldMetadata;

const buildPath = ({
  objectMetadataId,
  firstFieldMetadataId,
  isInherent,
}: {
  objectMetadataId: string;
  firstFieldMetadataId: string;
  isInherent: boolean;
}) =>
  ({
    id: firstFieldMetadataId,
    universalIdentifier: firstFieldMetadataId,
    objectMetadataId,
    firstFieldMetadataId,
    secondFieldMetadataId: null,
    thirdFieldMetadataId: null,
    isInherent,
  }) as FlatRelatedRecordPath;

const attachment = buildObject('attachment');
const flatFieldMetadataMaps = buildFlatEntityMaps([
  buildRelationField({
    id: 'companyAttachments',
    objectMetadataId: 'company',
    relationTargetObjectMetadataId: 'attachment',
    relationType: RelationType.ONE_TO_MANY,
    relationTargetFieldMetadataId: 'attachmentTargetCompany',
  }),
  buildRelationField({
    id: 'attachmentTargetCompany',
    objectMetadataId: 'attachment',
    relationTargetObjectMetadataId: 'company',
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'targetCompanyId',
  }),
  buildRelationField({
    id: 'opportunityCompany',
    objectMetadataId: 'opportunity',
    relationTargetObjectMetadataId: 'company',
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'companyId',
  }),
]);

const READ_ALL_RECORDS: ObjectRecordsPermissions = {
  canCreateAllRecords: false,
  canReadAllRecords: true,
  canUpdateAllRecords: false,
  canSoftDeleteAllRecords: false,
  canDestroyAllRecords: false,
  unreadableFields: [],
  uneditableFields: [],
};
const READ_THROUGH_RLS_RULE: ObjectRecordsPermissions = {
  ...READ_ALL_RECORDS,
  canReadAllRecords: false,
  rowLevelRecordsPermissions: [],
};

const salesMember: PermissionsPrincipalsWithRolesContext = {
  workspaceId: 'workspace-id',
  mainPrincipal: {
    type: 'workspaceMember',
    roleId: 'sales',
    workspaceMemberId: 'member-id',
  },
  applicationPrincipal: { type: 'customApplication' },
};

const buildCallerAccessGroupObjectMetadataIds = ({
  isCompanyAttachmentsPathInherent = false,
  objectNamesWithRlsRule = ['company'],
  isAccessGroupsEnabled = true,
  operationType = 'read',
  principals = salesMember,
}: {
  isCompanyAttachmentsPathInherent?: boolean;
  objectNamesWithRlsRule?: string[];
  isAccessGroupsEnabled?: boolean;
  operationType?: ObjectRecordsOperationType;
  principals?: PermissionsPrincipalsWithRolesContext;
} = {}) =>
  buildCallerRelatedRecordPathAccessGroupsOrThrow({
    request: {
      principals,
      flatObjectMetadata: attachment,
      operationType,
      metadataMaps: {
        featureFlagsMap: {
          [FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED]: isAccessGroupsEnabled,
        },
        rolesPermissions: {
          sales: {
            objects: {
              company: READ_ALL_RECORDS,
              opportunity: READ_ALL_RECORDS,
            },
          },
          manager: {
            objects: Object.fromEntries(
              objectNamesWithRlsRule.map((objectName) => [
                objectName,
                READ_THROUGH_RLS_RULE,
              ]),
            ),
          },
        },
        flatObjectMetadataMaps: buildFlatEntityMaps([
          buildObject('company'),
          buildObject('opportunity'),
          attachment,
        ]),
        flatFieldMetadataMaps,
        flatRelatedRecordPathMaps: buildFlatEntityMaps([
          buildPath({
            objectMetadataId: 'company',
            firstFieldMetadataId: 'companyAttachments',
            isInherent: isCompanyAttachmentsPathInherent,
          }),
          buildPath({
            objectMetadataId: 'opportunity',
            firstFieldMetadataId: 'opportunityCompany',
            isInherent: false,
          }),
        ]),
      } as unknown as PermissionsMetadataMaps,
    },
    workspaceMembers: [],
    flatFieldMetadataMaps,
  }).map(({ objectMetadataId }) => objectMetadataId);

describe('buildCallerRelatedRecordPathAccessGroupsOrThrow', () => {
  it('should hold the groups of the caller on the source object of a path', () => {
    expect(buildCallerAccessGroupObjectMetadataIds()).toEqual(['company']);
  });

  it('should also hold the groups reaching the source of an inherent path', () => {
    expect(
      buildCallerAccessGroupObjectMetadataIds({
        isCompanyAttachmentsPathInherent: true,
        objectNamesWithRlsRule: ['opportunity'],
      }),
    ).toEqual(['company', 'opportunity']);
  });

  it('should not go past the source of a regular path', () => {
    expect(
      buildCallerAccessGroupObjectMetadataIds({
        objectNamesWithRlsRule: ['company', 'opportunity'],
      }),
    ).toEqual(['company']);
  });

  it('should hold no group when no RLS rule restricts the source object', () => {
    expect(
      buildCallerAccessGroupObjectMetadataIds({ objectNamesWithRlsRule: [] }),
    ).toEqual([]);
  });

  it('should hold no group when access groups are disabled', () => {
    expect(
      buildCallerAccessGroupObjectMetadataIds({ isAccessGroupsEnabled: false }),
    ).toEqual([]);
  });

  it('should hold no group for a write', () => {
    expect(
      buildCallerAccessGroupObjectMetadataIds({ operationType: 'update' }),
    ).toEqual([]);
  });

  it('should hold no group when a limiting role does not reach every source record', () => {
    expect(
      buildCallerAccessGroupObjectMetadataIds({
        principals: {
          ...salesMember,
          applicationPrincipal: {
            type: 'application',
            roleId: 'manager',
            applicationId: 'application-id',
          },
        },
      }),
    ).toEqual([]);
  });
});
