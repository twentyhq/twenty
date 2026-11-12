import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
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

const buildNoteQuery = (
  relatedRecordPathAccessGroupSources: Parameters<
    typeof buildRecomputeRecordAccessGroupIdsQuery
  >[0]['relatedRecordPathAccessGroupSources'],
) =>
  buildRecomputeRecordAccessGroupIdsQuery({
    workspaceId: WORKSPACE_ID,
    flatObjectMetadata: note,
    recordAccessGroupSQLConditions: [{ compactId: 7, sqlCondition: null }],
    relatedRecordPathAccessGroupSources,
    recordIds: ['note-id'],
  });

const COMPANY_TO_NOTE_HOPS = [
  {
    flatObjectMetadata: company,
    sourceColumnName: 'id',
    targetColumnName: 'companyId',
  },
  {
    flatObjectMetadata: noteTarget,
    sourceColumnName: 'noteId',
    targetColumnName: 'id',
  },
];

describe('buildRecomputeRecordAccessGroupIdsQuery', () => {
  it('should only compute own groups when no path leads to the object', () => {
    expect(buildNoteQuery([]).sql).toContain(
      'ARRAY_REMOVE(CAST(ARRAY[7] AS integer[]), NULL) AS "accessGroupIds"',
    );
  });

  it('should pass on only the own groups of the source through a regular path', () => {
    const { sql, parameters } = buildNoteQuery([
      {
        hops: COMPANY_TO_NOTE_HOPS,
        sourceObjectCompactIds: [12, 13],
        isSourcePrivacyApplicable: true,
      },
    ]);

    expect(sql).toContain(
      `ARRAY(SELECT DISTINCT "accessGroupId" FROM unnest(ARRAY_REMOVE(CAST(ARRAY[7] AS integer[]), NULL) || ARRAY(SELECT "inherited"."accessGroupId" FROM "${SCHEMA}"."_company" AS "related_record_path_0_0", "${SCHEMA}"."_noteTarget" AS "related_record_path_0_1", unnest("related_record_path_0_0"."_accessGroupIds") AS "inherited"("accessGroupId") WHERE "related_record_path_0_1"."companyId" = "related_record_path_0_0"."id" AND "related_record_path_0_0"."deletedAt" IS NULL AND "record"."id" = "related_record_path_0_1"."noteId" AND "related_record_path_0_1"."deletedAt" IS NULL AND "related_record_path_0_0"."_isPrivate" = FALSE AND "inherited"."accessGroupId" = ANY(CAST(:relatedRecordPathSourceCompactIds_0 AS integer[])))) AS "accessGroupId" ORDER BY "accessGroupId")`,
    );
    expect(parameters).toEqual({
      recordIds: ['note-id'],
      relatedRecordPathSourceCompactIds_0: [12, 13],
    });
  });

  it('should pass on every group of the source through an inherent path', () => {
    const { sql, parameters } = buildNoteQuery([
      {
        hops: COMPANY_TO_NOTE_HOPS,
        sourceObjectCompactIds: null,
        isSourcePrivacyApplicable: false,
      },
    ]);

    expect(sql).not.toContain('relatedRecordPathSourceCompactIds');
    expect(sql).not.toContain('_isPrivate');
    expect(parameters).toEqual({ recordIds: ['note-id'] });
  });
});
