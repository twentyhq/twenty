import { RecordShareAccessLevel } from 'twenty-shared/types';

import { compileNamedParameters } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';
import { buildRecordShareCondition } from 'src/engine/twenty-orm/utils/build-record-share-condition.util';

const OBJECT_METADATA_ID = 'object-metadata-1';
const PRINCIPAL_IDS = ['principal-1', 'principal-2'];
const ACCESS_LEVELS = [
  RecordShareAccessLevel.READ_WRITE,
  RecordShareAccessLevel.FULL,
];

const build = () =>
  buildRecordShareCondition({
    tableAlias: 'company',
    recordShareTableExpression: '"workspace_abc"."recordShare"',
    objectMetadataId: OBJECT_METADATA_ID,
    principalIds: PRINCIPAL_IDS,
    accessLevels: ACCESS_LEVELS,
  });

describe('buildRecordShareCondition', () => {
  it('should render a correlated EXISTS on the record share table', () => {
    const { sql, parameters } = build();
    const parameterNames = Object.keys(parameters);

    const [objectMetadataIdParameterName] = parameterNames.filter((name) =>
      name.startsWith('recordShareObjectMetadataId_'),
    );
    const [principalIdsParameterName] = parameterNames.filter((name) =>
      name.startsWith('recordSharePrincipalIds_'),
    );
    const [accessLevelsParameterName] = parameterNames.filter((name) =>
      name.startsWith('recordShareAccessLevels_'),
    );

    expect(sql).toBe(
      `EXISTS (SELECT 1 FROM "workspace_abc"."recordShare" AS "company_recordShare" WHERE "company_recordShare"."recordId" = "company"."id" AND "company_recordShare"."objectMetadataId" = :${objectMetadataIdParameterName} AND "company_recordShare"."principalId" = ANY(:${principalIdsParameterName}) AND "company_recordShare"."accessLevel" IN (:...${accessLevelsParameterName}) AND "company_recordShare"."deletedAt" IS NULL)`,
    );
    expect(parameters).toEqual({
      [objectMetadataIdParameterName]: OBJECT_METADATA_ID,
      [principalIdsParameterName]: PRINCIPAL_IDS,
      [accessLevelsParameterName]: ACCESS_LEVELS,
    });
  });

  it('should compile to positional parameters with the access levels spread', () => {
    const { sql, parameters } = build();

    expect(compileNamedParameters(sql, parameters)).toEqual({
      text: 'EXISTS (SELECT 1 FROM "workspace_abc"."recordShare" AS "company_recordShare" WHERE "company_recordShare"."recordId" = "company"."id" AND "company_recordShare"."objectMetadataId" = $1 AND "company_recordShare"."principalId" = ANY($2) AND "company_recordShare"."accessLevel" IN ($3, $4) AND "company_recordShare"."deletedAt" IS NULL)',
      values: [
        OBJECT_METADATA_ID,
        PRINCIPAL_IDS,
        RecordShareAccessLevel.READ_WRITE,
        RecordShareAccessLevel.FULL,
      ],
    });
  });

  it('should use distinct parameter names on every call', () => {
    const first = build();
    const second = build();

    expect(
      Object.keys(first.parameters).filter(
        (parameterName) => parameterName in second.parameters,
      ),
    ).toEqual([]);
  });

  it('should correlate on the given record id expression', () => {
    const { sql } = buildRecordShareCondition({
      tableAlias: 'attachment',
      recordShareTableExpression: '"workspace_abc"."recordShare"',
      objectMetadataId: OBJECT_METADATA_ID,
      principalIds: PRINCIPAL_IDS,
      accessLevels: ACCESS_LEVELS,
      recordIdExpression: '"attachment"."targetNoteId"',
    });

    expect(sql).toContain(
      '"attachment_recordShare"."recordId" = "attachment"."targetNoteId"',
    );
  });

  it('should escape the alias it derives', () => {
    const { sql } = buildRecordShareCondition({
      tableAlias: 'per"son',
      recordShareTableExpression: '"workspace_abc"."recordShare"',
      objectMetadataId: OBJECT_METADATA_ID,
      principalIds: PRINCIPAL_IDS,
      accessLevels: ACCESS_LEVELS,
    });

    expect(sql).toContain('AS "per""son_recordShare"');
    expect(sql).toContain('= "per""son"."id"');
  });
});
