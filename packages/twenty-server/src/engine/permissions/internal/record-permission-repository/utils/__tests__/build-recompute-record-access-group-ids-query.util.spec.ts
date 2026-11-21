import { FeatureFlagKey } from 'twenty-shared/types';

import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { buildRecomputeRecordAccessGroupIdsQuery } from 'src/engine/permissions/internal/record-permission-repository/utils/build-recompute-record-access-group-ids-query.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000000';
const SCHEMA = getWorkspaceSchemaName(WORKSPACE_ID);

const buildObject = (nameSingular: string) =>
  getFlatObjectMetadataMock({
    id: nameSingular,
    universalIdentifier: nameSingular,
    nameSingular,
  });

const company = buildObject('company');
const noteTarget = buildObject('noteTarget');
const note = buildObject('note');

const COMPANY_TO_NOTE_HOPS = [
  {
    flatObjectMetadata: company,
    relationFieldMetadataId: 'company-note-targets-field-id',
    sourceColumnName: 'id',
    targetColumnName: 'companyId',
  },
  {
    flatObjectMetadata: noteTarget,
    relationFieldMetadataId: 'note-target-note-field-id',
    sourceColumnName: 'noteId',
    targetColumnName: 'id',
  },
];

const buildAccessGroup = ({
  compactId,
  objectMetadataId,
}: Pick<AccessGroup, 'compactId' | 'objectMetadataId'>): AccessGroup => ({
  compactId,
  objectMetadataId,
  groupHash: `group-${compactId}`,
  type: 'ALL_RECORDS',
  ruleShapeHash: `shape-${compactId}`,
  unreadableFieldIds: [],
});

const buildNoteQuery = ({
  isInherent,
  isPrivateRecordsEnabled = false,
  companyUnreadableFields = [],
  companyRuleUnreadableFields = [],
}: {
  isInherent: boolean;
  isPrivateRecordsEnabled?: boolean;
  companyUnreadableFields?: string[];
  companyRuleUnreadableFields?: string[];
}) =>
  buildRecomputeRecordAccessGroupIdsQuery({
    workspaceId: WORKSPACE_ID,
    flatObjectMetadata: note,
    recordAccessGroupSQLConditions: [{ compactId: 7, sqlCondition: null }],
    accessGroupValueLookupIdsSQLConditions: [],
    resolvedRelatedRecordPaths: [
      {
        isInherent,
        sourceFlatObjectMetadata: company,
        targetObjectMetadataId: note.id,
        hops: COMPANY_TO_NOTE_HOPS,
      },
    ],
    accessGroups: [
      buildAccessGroup({ compactId: 7, objectMetadataId: note.id }),
      buildAccessGroup({ compactId: 12, objectMetadataId: company.id }),
      buildAccessGroup({ compactId: 13, objectMetadataId: company.id }),
    ],
    metadataMaps: {
      featureFlagsMap: {
        [FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED]: isPrivateRecordsEnabled,
      },
      rolesPermissions: {
        'role-id': {
          canReadAllRecords: true,
          canUpdateAllRecords: true,
          canSoftDeleteAllRecords: true,
          canDestroyAllRecords: true,
          objects: {
            [company.id]: {
              canCreateAllRecords: true,
              canReadAllRecords: false,
              canUpdateAllRecords: false,
              canSoftDeleteAllRecords: false,
              canDestroyAllRecords: false,
              unreadableFields: companyUnreadableFields,
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
                  unreadableFields: companyRuleUnreadableFields,
                  uneditableFields: [],
                },
              ],
            },
          },
        },
      },
    },
    recordIds: ['note-id'],
  });

describe('buildRecomputeRecordAccessGroupIdsQuery', () => {
  it('should only compute own groups when no path leads to the object', () => {
    expect(
      buildRecomputeRecordAccessGroupIdsQuery({
        workspaceId: WORKSPACE_ID,
        flatObjectMetadata: note,
        recordAccessGroupSQLConditions: [{ compactId: 7, sqlCondition: null }],
        accessGroupValueLookupIdsSQLConditions: [],
        resolvedRelatedRecordPaths: [],
        accessGroups: [],
        metadataMaps: { featureFlagsMap: {}, rolesPermissions: {} },
        recordIds: ['note-id'],
      }).sql,
    ).toContain(
      'ARRAY_REMOVE(CAST(ARRAY[7] AS integer[]), NULL) AS "accessGroupIds"',
    );
  });

  it('should pass on only the own groups of the source through a regular path', () => {
    const { sql, parameters } = buildNoteQuery({
      isInherent: false,
      isPrivateRecordsEnabled: true,
    });

    expect(sql).toContain(
      `ARRAY(SELECT DISTINCT "accessGroupId" FROM unnest(ARRAY_REMOVE(CAST(ARRAY[7] AS integer[]), NULL) || ARRAY(SELECT "inherited"."accessGroupId" FROM "${SCHEMA}"."_company" AS "related_record_path_0_0", "${SCHEMA}"."_noteTarget" AS "related_record_path_0_1", unnest("related_record_path_0_0"."_accessGroupIds") AS "inherited"("accessGroupId") WHERE "related_record_path_0_1"."companyId" = "related_record_path_0_0"."id" AND "related_record_path_0_0"."deletedAt" IS NULL AND "record"."id" = "related_record_path_0_1"."noteId" AND "related_record_path_0_1"."deletedAt" IS NULL AND "related_record_path_0_0"."_isPrivate" = FALSE AND "inherited"."accessGroupId" = ANY(CAST(:relatedRecordPathSourceCompactIds_0 AS integer[])))) AS "accessGroupId" ORDER BY "accessGroupId")`,
    );
    expect(parameters).toEqual({
      recordIds: ['note-id'],
      relatedRecordPathSourceCompactIds_0: [12, 13],
    });
  });

  it('should pass on every group of the source through an inherent path', () => {
    const { sql, parameters } = buildNoteQuery({ isInherent: true });

    expect(sql).not.toContain('relatedRecordPathSourceCompactIds');
    expect(sql).not.toContain('_isPrivate');
    expect(sql).not.toContain('inheritedAccessGroup');
    expect(parameters).toEqual({ recordIds: ['note-id'] });
  });

  it.each([
    {
      title: 'a role cannot read it on any record',
      companyUnreadableFields: ['company-note-targets-field-id'],
      companyRuleUnreadableFields: [],
    },
    {
      title: 'a rule cannot read it on the records it matches',
      companyUnreadableFields: [],
      companyRuleUnreadableFields: ['company-note-targets-field-id'],
    },
  ])(
    'should not pass on the groups that cannot read the first relation when $title',
    ({ companyUnreadableFields, companyRuleUnreadableFields }) => {
      const { sql, parameters } = buildNoteQuery({
        isInherent: true,
        companyUnreadableFields,
        companyRuleUnreadableFields,
      });

      expect(sql).toContain(
        `NOT EXISTS (SELECT 1 FROM "${SCHEMA}"."accessGroup" AS "inheritedAccessGroup" WHERE "inheritedAccessGroup"."compactId" = "inherited"."accessGroupId" AND CAST(:relatedRecordPathUnreadableRelation_0 AS uuid) = ANY("inheritedAccessGroup"."unreadableFieldIds"))`,
      );
      expect(parameters).toEqual({
        recordIds: ['note-id'],
        relatedRecordPathUnreadableRelation_0: 'company-note-targets-field-id',
      });
    },
  );
});
