import { type ObjectRecordsPermissions } from 'twenty-shared/types';

import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { findRelatedRecordPathsFeedingAccessGroups } from 'src/engine/permissions/internal/access-group/utils/find-related-record-paths-feeding-access-groups.util';
import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const buildObject = (objectName: string): FlatObjectMetadata =>
  getFlatObjectMetadataMock({
    id: objectName,
    universalIdentifier: objectName,
  });

const REGION = buildObject('region');
const COMPANY = buildObject('company');
const PERSON = buildObject('person');
const NOTE = buildObject('note');

const buildPath = ({
  source,
  target,
  isInherent,
}: {
  source: FlatObjectMetadata;
  target: FlatObjectMetadata;
  isInherent: boolean;
}): ResolvedRelatedRecordPath => ({
  isInherent,
  sourceFlatObjectMetadata: source,
  targetObjectMetadataId: target.id,
  hops: [],
});

const OBJECT_RECORDS_PERMISSIONS_WITH_RLS_RULE: ObjectRecordsPermissions = {
  canCreateAllRecords: false,
  canReadAllRecords: false,
  canUpdateAllRecords: false,
  canSoftDeleteAllRecords: false,
  canDestroyAllRecords: false,
  unreadableFields: [],
  uneditableFields: [],
  rowLevelRecordsPermissions: [
    {
      ruleId: 'rule-id',
      canCreateRecords: false,
      canReadRecords: true,
      canUpdateRecords: false,
      canSoftDeleteRecords: false,
      canDestroyRecords: false,
      predicates: [],
      predicateGroups: [],
      unreadableFields: [],
      uneditableFields: [],
    },
  ],
};

const buildRolesPermissions = (
  objectNamesWithRlsRule: string[],
): Record<string, RoleRecordsPermissions> => ({
  sales: {
    canReadAllRecords: true,
    canUpdateAllRecords: true,
    canSoftDeleteAllRecords: true,
    canDestroyAllRecords: true,
    objects: Object.fromEntries(
      objectNamesWithRlsRule.map((objectName) => [
        objectName,
        OBJECT_RECORDS_PERMISSIONS_WITH_RLS_RULE,
      ]),
    ),
  },
});

const REGION_TO_COMPANY = buildPath({
  source: REGION,
  target: COMPANY,
  isInherent: false,
});
const COMPANY_TO_PERSON = buildPath({
  source: COMPANY,
  target: PERSON,
  isInherent: false,
});
const COMPANY_TO_NOTE = buildPath({
  source: COMPANY,
  target: NOTE,
  isInherent: true,
});

const findFeedingPaths = ({
  objectMetadataId,
  objectNamesWithRlsRule,
}: {
  objectMetadataId: string;
  objectNamesWithRlsRule: string[];
}) =>
  findRelatedRecordPathsFeedingAccessGroups({
    rolesPermissions: buildRolesPermissions(objectNamesWithRlsRule),
    resolvedRelatedRecordPaths: [
      REGION_TO_COMPANY,
      COMPANY_TO_PERSON,
      COMPANY_TO_NOTE,
    ],
    objectMetadataId,
  });

describe('findRelatedRecordPathsFeedingAccessGroups', () => {
  it('should feed nothing when no object has an RLS rule', () => {
    expect(
      findFeedingPaths({
        objectMetadataId: 'note',
        objectNamesWithRlsRule: [],
      }),
    ).toEqual([]);
  });

  it('should feed the object through a path whose source has an RLS rule', () => {
    expect(
      findFeedingPaths({
        objectMetadataId: 'person',
        objectNamesWithRlsRule: ['company'],
      }),
    ).toEqual([COMPANY_TO_PERSON]);
  });

  it('should not feed through a regular path whose source is only reached through a path', () => {
    expect(
      findFeedingPaths({
        objectMetadataId: 'person',
        objectNamesWithRlsRule: ['region'],
      }),
    ).toEqual([]);
  });

  it('should feed through an inherent path whose source is reached through a path', () => {
    expect(
      findFeedingPaths({
        objectMetadataId: 'note',
        objectNamesWithRlsRule: ['region'],
      }),
    ).toEqual([COMPANY_TO_NOTE]);
  });

  it('should stop on inherent paths saved as a cycle', () => {
    expect(
      findRelatedRecordPathsFeedingAccessGroups({
        rolesPermissions: buildRolesPermissions([]),
        resolvedRelatedRecordPaths: [
          COMPANY_TO_NOTE,
          buildPath({
            source: NOTE,
            target: COMPANY,
            isInherent: true,
          }),
        ],
        objectMetadataId: 'note',
      }),
    ).toEqual([]);
  });
});
